import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from 'cloudinary';
import { authOptions } from "@/lib/auth";

// تكوين Cloudinary باستخدام المتغيرات البيئية الحالية
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const formData = await req.formData();
    const formDataEntries = Array.from(formData.entries());

    // Handle images upload
    const images = formDataEntries
      .filter(([key]) => key.startsWith("images["))
      .map(([, file]) => file as File);

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: "At least one image is required" }), { status: 400 });
    }

    // Upload images to Cloudinary
    const uploadImage = async (file: File) => {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const result = await cloudinary.uploader.upload(`data:${file.type};base64,${base64}`);
      return result.secure_url;
    };

    const imageUrls = await Promise.all(images.map((image) => uploadImage(image)));

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

    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      birthDate: birthDate ? new Date(birthDate) : null,
      age: age, // Calculated age from birthDate
      state: formData.get("state"),
      municipality: formData.get("municipality"),
      phone: formData.get("phone"),
      educationLevel: formData.get("educationLevel"),
      academicYears: formData.get("academicYears"),
      diploma: formData.get("diploma"),
      diplomaName: formData.get("diplomaName"),
      specialization: formData.get("specialization"),
      aboutMe: formData.get("aboutMe"),
      hasExperience: formData.get("hasExperience") === "true",
      experienceDuration: formData.get("experienceDuration"),
      previousPosition: formData.get("previousPosition"),
    };

    const userEmail = session.user?.email;

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "User email not found in session" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email: userEmail });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const jobRequest = {
      ...data,
      userId: user._id,
      images: imageUrls,
      createdAt: new Date(),
    };

    const result = await db.collection("jobRequests").insertOne(jobRequest);

    return new Response(JSON.stringify({ success: true, requestId: result.insertedId }), { status: 201 });
  } catch (error) {
    console.error("Error handling job request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userEmail = session.user?.email;

  if (!userEmail) {
    return new Response(JSON.stringify({ error: "User email not found in session" }), { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email: userEmail });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const jobRequests = await db
      .collection("jobRequests")
      .find({ userId: new ObjectId(user._id) })
      .toArray();

    return new Response(JSON.stringify(jobRequests), { status: 200 });
  } catch (error) {
    console.error("Error fetching job requests:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userEmail = session?.user?.email;

  try {
    const { searchParams } = new URL(req.url);
    const jobRequestId = searchParams.get("id");

    if (!jobRequestId) {
      return new Response(JSON.stringify({ error: "Job request ID is required" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const deleteResult = await db
      .collection("jobRequests")
      .deleteOne({ _id: new ObjectId(jobRequestId) });

    if (deleteResult.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Job request not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Job request deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deleting job request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
