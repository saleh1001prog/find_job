import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user ID first
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { _id: 1 } }
    );

    if (!user) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Get notifications for this user
    const notifications = await db.collection("notifications")
      .find({ recipientId: user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return new Response(JSON.stringify(notifications), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify([]), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const notification = await request.json();
    
    const client = await clientPromise;
    const db = client.db();

    // Create new notification with isRead and readAt fields
    const newNotification = {
      ...notification,
      recipientId: new ObjectId(notification.recipientId),
      type: notification.type,
      message: notification.type === 'application_accepted' 
        ? `Interview scheduled with ${notification.companyName}`
        : notification.message,
      isRead: false,
      createdAt: new Date(),
      readAt: null,
      applicationId: notification.applicationId,
      interview: notification.interview
    };

    await db.collection("notifications").insertOne(newNotification);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ error: "Error creating notification" }), 
      { status: 500 }
    );
  }
} 