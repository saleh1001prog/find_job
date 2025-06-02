import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
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

    const applications = await db.collection("jobApplications")
      .aggregate([
        {
          $match: { applicantEmail: session.user.email }
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
        },
        {
          $sort: { appliedAt: -1 }
        }
      ])
      .toArray();

    return new Response(JSON.stringify(applications), { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching applications" }), 
      { status: 500 }
    );
  }
} 