import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user ID
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { _id: 1 } }
    );

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Update notification only if it belongs to this user
    const result = await db.collection("notifications").updateOne(
      { 
        _id: new ObjectId(resolvedParams.notificationId),
        recipientId: user._id
      },
      { 
        $set: { 
          isRead: true,
          readAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Notification not found" }), 
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification marked as read" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return new Response(
      JSON.stringify({ error: "Error updating notification" }), 
      { status: 500 }
    );
  }
} 