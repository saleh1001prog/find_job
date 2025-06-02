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
    const avatarFile = formData.get("avatar") as File;

    if (!avatarFile) {
      return new Response(JSON.stringify({ error: "No file provided" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Upload to Cloudinary with progress monitoring
    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { 
          folder: "avatars",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Upload failed"));
        }
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    }) as { secure_url: string };

    // Update user in database
    const client = await clientPromise;
    const db = client.db();
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { avatar: uploadResult.secure_url } }
    );

    return new Response(JSON.stringify({ 
      message: "Avatar updated successfully",
      avatar: uploadResult.secure_url
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error('Avatar update error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to update avatar" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 