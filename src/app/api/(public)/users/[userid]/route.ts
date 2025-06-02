//src\app\api\users\[userid]\route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  context: { params: { userid: string } }
) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'type';

  try {
    const { userid } = await context.params;
    const client = await clientPromise;
    const db = client.db();

    if (endpoint === 'type') {
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userid) },
        { projection: { userType: 1 } }
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ userType: user.userType });
    }

    if (endpoint === 'company') {
      // Logic for company endpoint
      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userid) },
        {
          projection: {
            email: 1,
            image: 1,
            avatar: 1,
            companyDetails: 1,
            userType: 1,
          }
        }
      );

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.userType !== 'company') {
        return NextResponse.json({ error: "User is not a company" }, { status: 400 });
      }

      return NextResponse.json(user);
    } else if (endpoint === 'offers') {
      // Logic for offers endpoint
      const userProfile = await db.collection("users").findOne(
        { _id: new ObjectId(userid) },
        { 
          projection: { 
            userType: 1,
            companyDetails: 1,
            avatar: 1
          }
        }
      );

      if (!userProfile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (userProfile.userType !== 'company') {
        return NextResponse.json({ error: "User is not a company" }, { status: 400 });
      }

      const offers = await db
        .collection('jobOffers')
        .aggregate([
          { 
            $match: { 
              userId: new ObjectId(userid)
            } 
          },
          { $sort: { createdAt: -1 } }
        ])
        .toArray();

      const enrichedOffers = offers.map(offer => ({
        ...offer,
        companyName: userProfile.companyDetails?.companyName,
        companyImage: userProfile.avatar
      }));

      return NextResponse.json({
        profile: {
          ...userProfile,
          companyName: userProfile.companyDetails?.companyName
        },
        offers: enrichedOffers
      });
    } else {
      return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'خطأ في تحميل البيانات' },
      { status: 500 }
    );
  }
}

// Add PATCH method for updating user data
export async function PATCH(
  req: Request,
  { params }: { params: { userid: string } }
) {
  try {
    const { userid } = params;
    const updateData = await req.json();
    
    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userid) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add DELETE method for removing user data
export async function DELETE(
  req: Request,
  { params }: { params: { userid: string } }
) {
  try {
    const { userid } = params;
    
    const client = await clientPromise;
    const db = client.db();

    // Delete user's job offers
    await db.collection("jobOffers").deleteMany({ 
      userId: new ObjectId(userid) 
    });

    // Delete user's job requests
    await db.collection("jobRequests").deleteMany({ 
      userId: new ObjectId(userid) 
    });

    // Delete the user
    const result = await db.collection("users").deleteOne({ 
      _id: new ObjectId(userid) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
