import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    console.log('User email:', session.user.email);

    const client = await clientPromise;
    const db = client.db();

    // تعديل الاستعلام للبحث عن الطلبات إما بالبريد الإلكتروني أو معرف المستخدم
    const user = await db.collection("users").findOne({ email: session.user.email });
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    let query = {};
    if (user.userType === 'company') {
      // تحويل معرف المستخدم إلى ObjectId للمطابقة
      query = { companyId: new ObjectId(user._id) };
    } else {
      // إذا كان المستخدم عادي، ابحث عن طلباته
      query = { applicantEmail: session.user.email };
    }

    console.log('Query:', query);

    const applications = await db.collection("jobApplications")
      .find(query)
      .sort({ appliedAt: -1 })
      .toArray();

    console.log('Found applications:', applications.length);

    return new Response(JSON.stringify(applications), { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching applications" }), 
      { status: 500 }
    );
  }
} 