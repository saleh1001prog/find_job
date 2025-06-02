import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const formData = await req.formData();
    const coverImageFile = formData.get("coverImage") as File;

    if (!coverImageFile) {
      return new Response(JSON.stringify({ error: "No file provided" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Upload to Cloudinary
    const arrayBuffer = await coverImageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { 
          folder: "covers",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    }) as { secure_url: string };

    // Update user in database
    const client = await clientPromise;
    const db = client.db();
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { coverImage: uploadResult.secure_url } }
    );

    return new Response(JSON.stringify({ 
      message: "Cover image updated successfully",
      coverImage: uploadResult.secure_url
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error('Cover image update error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to update cover image" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 