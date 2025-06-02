import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401 });
    }

    const { applicationId } = params;
    const { positionTitle, status } = await req.json();

    if (!positionTitle || !status) {
      return new Response(
        JSON.stringify({ error: "بيانات غير مكتملة" }), 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const company = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1, _id: 1 } }
    );

    if (!company || company.userType !== 'company') {
      return new Response(
        JSON.stringify({ error: "غير مصرح بتحديث حالة الطلبات" }), 
        { status: 403 }
      );
    }

    // تحديث حالة المنصب المحدد في الطلب
    const result = await db.collection("jobApplications").updateOne(
      { 
        _id: new ObjectId(applicationId),
        companyId: company._id,
        "positions.title": positionTitle 
      },
      { 
        $set: { 
          "positions.$.status": status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "لم يتم العثور على الطلب أو المنصب" }), 
        { status: 404 }
      );
    }

    // تحديث الحالة العامة للطلب بناءً على حالات المناصب
    const application = await db.collection("jobApplications").findOne({
      _id: new ObjectId(applicationId)
    });

    if (application) {
      const allPositionsStatus = application.positions.map((p: any) => p.status);
      let overallStatus = "pending";

      if (allPositionsStatus.every((s: string) => s === "accepted")) {
        overallStatus = "accepted";
      } else if (allPositionsStatus.every((s: string) => s === "rejected")) {
        overallStatus = "rejected";
      }

      await db.collection("jobApplications").updateOne(
        { _id: new ObjectId(applicationId) },
        { $set: { status: overallStatus } }
      );
    }

    return new Response(
      JSON.stringify({ message: "تم تحديث حالة المنصب بنجاح" }), 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating position status:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء تحديث حالة المنصب" }), 
      { status: 500 }
    );
  }
} 