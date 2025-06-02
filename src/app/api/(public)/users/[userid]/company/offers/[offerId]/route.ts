import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  context: { params: { userid: string; offerId: string } }
) {
  try {
    const { userid, offerId } = context.params;
    const client = await clientPromise;
    const db = client.db();

    if (!ObjectId.isValid(offerId) || !ObjectId.isValid(userid)) {
      return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 });
    }

    const offer = await db.collection("jobOffers").findOne({
      _id: new ObjectId(offerId),
      userId: new ObjectId(userid)
    });

    if (!offer) {
      return NextResponse.json({ error: "لم يتم العثور على العرض" }, { status: 404 });
    }

    const company = await db.collection("users").findOne(
      { _id: new ObjectId(userid) },
      {
        projection: {
          companyDetails: 1,
          avatar: 1
        }
      }
    );

    const enrichedOffer = {
      ...offer,
      companyName: company?.companyDetails?.companyName,
      companyImage: company?.avatar
    };

    return NextResponse.json(enrichedOffer);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'خطأ في تحميل تفاصيل العرض' },
      { status: 500 }
    );
  }
} 