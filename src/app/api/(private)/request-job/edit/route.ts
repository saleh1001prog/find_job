import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

// تكوين Cloudinary باستخدام المتغيرات البيئية الحالية
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const jobRequest = await db.collection("jobRequests").findOne({ _id: new ObjectId(id) });

    if (!jobRequest) {
      return NextResponse.json({ error: "Job request not found" }, { status: 404 });
    }

    // تأكد من أن birthDate هو كائن Date
    const formattedJobRequest = {
      ...jobRequest,
      birthDate: jobRequest.birthDate ? new Date(jobRequest.birthDate) : null
    };

    return NextResponse.json(formattedJobRequest, { status: 200 });
  } catch (error) {
    console.error("Error fetching job request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const formData = await req.formData();
    const existingImages = JSON.parse(formData.get('existingImages') as string);
    
    // Calculate age from birthDate
    const birthDate = formData.get("birthDate") as string;
    let age = null;

    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
    }

    // Handle new image uploads
    const formDataEntries = Array.from(formData.entries());
    const newImages = formDataEntries
      .filter(([key]) => key.startsWith('images['))
      .map(([, file]) => file as File);

    // Upload new images to Cloudinary
    const uploadImage = async (file: File) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${base64}`
      );
      return result.secure_url;
    };

    const newImageUrls = await Promise.all(
      newImages.map(image => uploadImage(image))
    );

    // Combine existing and new image URLs
    const allImages = [...existingImages, ...newImageUrls];

    const client = await clientPromise;
    const db = client.db();

    // Update the document with all fields including images
    const updateData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      birthDate: birthDate ? new Date(birthDate) : null,
      age: age,
      state: formData.get('state'),
      municipality: formData.get('municipality'),
      phone: formData.get('phone'),
      educationLevel: formData.get('educationLevel'),
      academicYears: formData.get('academicYears'),
      diploma: formData.get('diploma'),
      specialization: formData.get('specialization'),
      aboutMe: formData.get('aboutMe'),
      hasExperience: formData.get('hasExperience') === 'true',
      experienceDuration: formData.get('experienceDuration'),
      previousPosition: formData.get('previousPosition'),
      diplomaName: formData.get('diplomaName'),
      images: allImages,
    };

    const result = await db.collection("jobRequests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job request not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: "Job request updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}