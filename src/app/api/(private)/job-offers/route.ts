import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const positions = JSON.parse(formData.get("positions") as string).map((position: any) => ({
      ...position,
      education: {
        ...position.education,
        details: getEducationYearsLabel(
          position.education.level,
          position.education.years
        )
      }
    }));

    const jobOffer = {
      userId: user._id,
      companyName: formData.get("companyName"),
      companyLocation: {
        state: formData.get("state"),
        municipality: formData.get("municipality"),
        address: formData.get("address"),
      },
      description: formData.get("description"),
      positions: positions,
      createdAt: new Date()
    };

    console.log('Job offer to be saved:', jobOffer);

    const result = await db.collection("jobOffers").insertOne(jobOffer);

    return NextResponse.json({ 
      success: true, 
      offerId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating job offer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const client = await clientPromise;
    const db = client.db();

    const query = userId ? { userId: new ObjectId(userId) } : {};
    const jobOffers = await db.collection("jobOffers")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(jobOffers, { status: 200 });
  } catch (error) {
    console.error("Error fetching job offers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Job offer ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // التحقق من أن المستخدم هو صاحب العرض
    const user = await db.collection("users").findOne({ email: session.user?.email });
    const jobOffer = await db.collection("jobOffers").findOne({ 
      _id: new ObjectId(id),
      userId: user?._id 
    });

    if (!jobOffer) {
      return NextResponse.json({ error: "Job offer not found or unauthorized" }, { status: 404 });
    }

    // حذف العرض
    const result = await db.collection("jobOffers").deleteOne({ 
      _id: new ObjectId(id),
      userId: user?._id
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete job offer" }, { status: 400 });
    }

    return NextResponse.json({ message: "Job offer deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error deleting job offer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getEducationYearsLabel(level: string, years: string): string {
  switch (level) {
    case 'moyen':
      return `${years}ème année moyenne`;
    case 'secondaire':
      return `${years}ème année secondaire`;
    case 'universitaire':
      return `${years}ème année universitaire`;
    case 'sans_condition':
      return 'Aucune condition requise';
    default:
      return '';
  }
} 