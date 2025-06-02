import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // التحقق من أن المستخدم فرد وليس شركة
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1 } }
    );

    if (!user || user.userType !== 'individual') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Individual access only" }), 
        { status: 403 }
      );
    }

    // البحث عن الطلب مع تفاصيل العرض والشركة
    const application = await db.collection("jobApplications").aggregate([
      {
        $match: {
          _id: new ObjectId(resolvedParams.applicationId),
          applicantEmail: session.user.email
        }
      },
      {
        $lookup: {
          from: "jobOffers",
          localField: "offerId",
          foreignField: "_id",
          as: "offer"
        }
      },
      {
        $unwind: "$offer"
      },
      {
        $lookup: {
          from: "users",
          localField: "offer.userId",
          foreignField: "_id",
          as: "company"
        }
      },
      {
        $unwind: "$company"
      },
      {
        $project: {
          _id: 1,
          positions: 1,
          status: 1,
          appliedAt: 1,
          interview: 1,
          offerDetails: {
            companyName: "$company.companyDetails.companyName",
            location: "$offer.location"
          }
        }
      }
    ]).next();

    if (!application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(application), { status: 200 });
  } catch (error) {
    console.error("Error fetching application:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching application details" }), 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // التحقق من أن المستخدم فرد وليس شركة
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1 } }
    );

    if (!user || user.userType !== 'individual') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Individual access only" }), 
        { status: 403 }
      );
    }

    // التحقق من وجود الطلب وأنه يخص المستخدم الحالي
    const application = await db.collection("jobApplications").findOne({
      _id: new ObjectId(params.applicationId),
      applicantEmail: session.user.email
    });

    if (!application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }), 
        { status: 404 }
      );
    }

    // حذف الطلب
    const result = await db.collection("jobApplications").deleteOne({
      _id: new ObjectId(params.applicationId),
      applicantEmail: session.user.email
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to delete application" }), 
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Application deleted successfully" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting application:", error);
    return new Response(
      JSON.stringify({ error: "Error deleting application" }), 
      { status: 500 }
    );
  }
} 