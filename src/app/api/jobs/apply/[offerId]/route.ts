import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const offerId = resolvedParams.offerId;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401 });
    }

    const body = await request.json();
    const { companyId, positionTitles } = body;

    if (!positionTitles || positionTitles.length === 0) {
      return new Response(
        JSON.stringify({ error: "يجب اختيار منصب واحد على الأقل" }), 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // التحقق من وجود العرض والمناصب
    const jobOffer = await db.collection("jobOffers").findOne({
      _id: new ObjectId(offerId),
      "positions.title": { $in: positionTitles }
    });

    if (!jobOffer) {
      return new Response(
        JSON.stringify({ error: "العرض أو المناصب غير موجودة" }), 
        { status: 404 }
      );
    }

    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1, firstName: 1, lastName: 1, _id: 1 } }
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: "لم يتم العثور على المستخدم" }), 
        { status: 404 }
      );
    }

    if (user.userType !== 'individual') {
      return new Response(
        JSON.stringify({ error: "يمكن للأفراد فقط التقدم لعروض العمل" }), 
        { status: 403 }
      );
    }

    const existingApplication = await db.collection("jobApplications").findOne({
      offerId: new ObjectId(offerId),
      applicantEmail: session.user.email
    });

    if (existingApplication) {
      return new Response(
        JSON.stringify({ error: "لقد تقدمت لهذا العرض مسبقاً" }), 
        { status: 400 }
      );
    }

    // إنشاء طلب واحد يحتوي على جميع المناصب
    const application = {
      offerId: new ObjectId(offerId),
      companyId: new ObjectId(companyId),
      applicantId: user._id,
      applicantEmail: session.user.email,
      applicantName: `${user.firstName} ${user.lastName}`,
      positions: positionTitles.map(title => ({
        title,
        status: "pending"
      })),
      appliedAt: new Date(),
      status: "pending", // الحالة العامة للطلب
      updatedAt: new Date()
    };

    const result = await db.collection("jobApplications").insertOne(application);

    // إنشاء إشعار للشركة
    const notification = {
      type: 'job_application',
      recipientId: new ObjectId(companyId),
      message: `تم استلام طلب توظيف جديد من ${application.applicantName}`,
      positions: positionTitles,
      applicantName: application.applicantName,
      applicationId: result.insertedId,
      offerId: new ObjectId(offerId)
    };

    await db.collection("notifications").insertOne(notification);

    return new Response(
      JSON.stringify({ message: "تم تقديم الطلب بنجاح" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء معالجة الطلب" }), 
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  try {
    const resolvedParams = await params;
    const offerId = resolvedParams.offerId;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ hasApplied: false }), { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db();

    const application = await db.collection("jobApplications").findOne({
      offerId: new ObjectId(offerId),
      applicantEmail: session.user.email
    });

    return new Response(
      JSON.stringify({ hasApplied: !!application }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء التحقق من حالة الطلب" }), 
      { status: 500 }
    );
  }
} 