import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const interviewDetails = await request.json();
    
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

    // تحديث الطلب مع تفاصيل المقابلة
    const application = await db.collection("jobApplications").findOneAndUpdate(
      { _id: new ObjectId(params.applicationId) },
      { 
        $set: { 
          interview: {
            ...interviewDetails,
            scheduledAt: new Date(),
            companyId: company._id
          },
          status: 'interview_scheduled'
        } 
      },
      { returnDocument: 'after' }
    );

    if (!application.value) {
      return new Response(
        JSON.stringify({ error: "Application not found" }), 
        { status: 404 }
      );
    }

    // إنشاء إشعار واحد للمتقدم
    await db.collection("notifications").insertOne({
      recipientId: new ObjectId(application.value.applicantId),
      type: 'interview_scheduled',
      message: `تم استدعائك لمقابلة عمل من قبل ${company.companyDetails.companyName}`,
      interviewDetails: {
        ...interviewDetails,
        companyName: company.companyDetails.companyName
      },
      applicationId: new ObjectId(params.applicationId),
      createdAt: new Date(),
      isRead: false
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error scheduling interview" }), 
      { status: 500 }
    );
  }
} 