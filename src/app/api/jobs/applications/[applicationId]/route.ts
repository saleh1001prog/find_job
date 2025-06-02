import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

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

    const application = await db.collection("jobApplications").findOne({
      _id: new ObjectId(resolvedParams.applicationId)
    });

    if (!application) {
      return new Response(
        JSON.stringify({ error: "Application not found" }), 
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(application), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching application" }), 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const resolvedParams = await params;
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
      { projection: { userType: 1 } }
    );

    if (!company || company.userType !== 'company') {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Company access only" }), 
        { status: 403 }
      );
    }

    // تحديث حالة الطلب وجميع المناصب
    await db.collection("jobApplications").updateOne(
      { _id: new ObjectId(resolvedParams.applicationId) },
      { 
        $set: { 
          status,
          "positions.$[].status": status,
          updatedAt: new Date()
        } 
      }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Error updating application status" }), 
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // التحقق من أن المستخدم شركة
    const company = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { userType: 1 } }
    );

    if (!company || company.userType !== 'company') {
      return NextResponse.json(
        { error: "Unauthorized - Company access only" }, 
        { status: 403 }
      );
    }

    // حذف الطلب
    const result = await db.collection("jobApplications").deleteOne({
      _id: new ObjectId(params.applicationId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Application not found" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Application deleted successfully" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Error deleting application" }, 
      { status: 500 }
    );
  }
} 