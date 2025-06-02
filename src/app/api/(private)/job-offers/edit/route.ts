import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const jobOffer = await db.collection("jobOffers").findOne({
      _id: new ObjectId(id)
    });

    if (!jobOffer) {
      return NextResponse.json({ error: "Job offer not found" }, { status: 404 });
    }

    return NextResponse.json(jobOffer);
  } catch (error) {
    console.error("Error fetching job offer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
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

    const updateData = {
      companyName: formData.get("companyName"),
      companyLocation: {
        state: formData.get("state"),
        municipality: formData.get("municipality"),
        address: formData.get("address"),
      },
      description: formData.get("description"),
      positions: positions,
      updatedAt: new Date()
    };

    console.log('Job offer update data:', updateData);

    const result = await db.collection("jobOffers").updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Job offer not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error updating job offer:", error);
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