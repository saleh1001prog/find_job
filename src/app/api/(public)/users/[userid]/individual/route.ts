import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  context: { params: { userid: string } }
) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'profile';

  try {
    const { userid } = await context.params;
    const client = await clientPromise;
    const db = client.db();

    // التحقق من المستخدم أولاً
    const userProfile = await db.collection("users").findOne(
      { _id: new ObjectId(userid) },
      {
        projection: {
          email: 1,
          image: 1,
          avatar: 1,
          firstName: 1,
          lastName: 1,
          phone: 1,
          birthDate: 1,
          userType: 1,
        }
      }
    );

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userProfile.userType !== 'individual') {
      return NextResponse.json({ error: "User is not an individual" }, { status: 400 });
    }

    // حذا كان الطلب للبيانات الأساسية فقط
    if (endpoint === 'profile') {
      const requestsCount = await db.collection("jobRequests")
        .countDocuments({ userId: new ObjectId(userid) });

      return NextResponse.json({
        ...userProfile,
        stats: {
          requestsCount
        }
      });
    }

    // إذا كان الطلب لطلبات العمل
    if (endpoint === 'requests') {
      const requests = await db
        .collection('jobRequests')
        .find({ userId: new ObjectId(userid) })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        profile: userProfile,
        requests: requests
      });
    }

    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'خطأ في تحميل البيانات' },
      { status: 500 }
    );
  }
} 