import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { status } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();

    // التحقق من أن المستخدم هو شركة
    const company = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1, companyDetails: 1 } }
    );

    if (!company || company.userType !== 'company') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Company access only" }), 
        { status: 403 }
      );
    }

    // تحديث حالة الطلب
    const result = await db.collection("jobApplications").updateOne(
      { _id: new ObjectId(params.applicationId) },
      { 
        $set: { 
          status,
          "positions.$[].status": status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Application not found" }), 
        { status: 404 }
      );
    }

    // إنشاء إشعار للمتقدم
    const application = await db.collection("jobApplications").findOne(
      { _id: new ObjectId(params.applicationId) }
    );

    if (application) {
      await db.collection("notifications").insertOne({
        recipientId: new ObjectId(application.applicantId),
        type: 'application_status',
        message: status === 'accepted' ? 
          `تم قبول طلبك للوظيفة في ${company.companyDetails.companyName}` :
          `تم رفض طلبك للوظيفة في ${company.companyDetails.companyName}`,
        status,
        applicationId: new ObjectId(params.applicationId),
        createdAt: new Date()
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error updating application status" }), 
      { status: 500 }
    );
  }
} 