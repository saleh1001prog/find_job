import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    let matchConditions: any = {
      userType: 'individual',
      isProfileComplete: true
    };

    if (search) {
      matchConditions.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // استخراج المرشحين مع البيانات الأساسية
    const candidates = await db
      .collection('users')
      .find(matchConditions, {
        projection: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          phone: 1,
          birthDate: 1,
          createdAt: 1,
          updatedAt: 1
        }
      })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db
      .collection('users')
      .countDocuments(matchConditions);

    // إضافة إحصائيات لكل مرشح
    const enrichedCandidates = candidates.map(candidate => ({
      ...candidate,
      stats: {
        jobRequestsCount: 0,
        applicationsCount: 0,
        experienceYears: 0,
        age: calculateAge(candidate.birthDate)
      }
    }));

    return NextResponse.json({
      candidates: enrichedCandidates,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'خطأ في تحميل البيانات' },
      { status: 500 }
    );
  }
}

// دالة لحساب العمر
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
