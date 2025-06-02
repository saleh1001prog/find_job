import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import cloudinary from "cloudinary";
import { authOptions } from "@/lib/auth";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

interface Contact {
  email: string;
  phone: string;
}

interface CompanyDetails {
  companyName: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  headquarters: FormDataEntryValue | null;
  branches: (string | File | null)[];
  contacts: Contact[];
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized access" }), 
      { status: 401 }
    );
  }

  try {
    const data = await req.json();

    // Validate required fields
    if (!data) {
      throw new Error("No data provided");
    }

    const { userType } = data;

    if (!userType) {
      throw new Error("User type is required");
    }

    const updateData: any = { userType, isProfileComplete: true };

    if (userType === "company") {
      // Handle company profile
      if (!data.companyDetails) {
        throw new Error("Company details are required");
      }

      updateData.companyDetails = {
        companyName: data.companyDetails.companyName,
        about: data.companyDetails.about,
        headquarters: data.companyDetails.headquarters,
        contacts: data.companyDetails.contacts || []
      };
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("users").updateOne(
      { email: session.user?.email },
      { 
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    if (!result.acknowledged) {
      throw new Error("Failed to update profile in database");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Profile updated successfully" 
      }), 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile update error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to update profile"
      }),
      { status: error.status || 500 }
    );
  }
}

// Helper function to parse contacts from FormData
function parseFormDataContacts(formData: FormData) {
  const contacts = [];
  let contactIndex = 0;
  
  while (formData.get(`contacts[${contactIndex}][email]`)) {
    contacts.push({
      email: String(formData.get(`contacts[${contactIndex}][email]`) || ''),
      phone: String(formData.get(`contacts[${contactIndex}][phone]`) || '')
    });
    contactIndex++;
  }
  
  return contacts;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "غير مصرح" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    console.log('Searching for user with email:', session.user.email); // للتتبع

    const user = await db.collection("users").findOne(
      { email: session.user.email },
      {
        projection: {
          firstName: 1,
          lastName: 1,
          phone: 1,
          birthDate: 1,
          avatar: 1,
          coverImage: 1,
          userType: 1,
          companyDetails: 1,
          isProfileComplete: 1,
          _id: 1
        }
      }
    );

    if (!user) {
      console.log('User not found for email:', session.user.email); // للتتبع
      return new Response(JSON.stringify({ error: "لم يتم العثور على المستخدم" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log('Found user:', { ...user, _id: user._id.toString() }); // للتتبع

    return new Response(JSON.stringify({
      ...user,
      _id: user._id.toString() // تحويل ObjectId إلى string
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Profile API error:', error); // للتتبع
    return new Response(
      JSON.stringify({ error: error.message || "فشل في جلب بيانات المستخدم" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
