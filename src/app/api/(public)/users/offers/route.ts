import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// دالة لاستخراج القطاعات من عناوين الوظائف
function extractSectorsFromTitles(jobTitles: string[]): string[] {
  const sectorKeywords = {
    'Informatique': ['développeur', 'developer', 'programmeur', 'informatique', 'it', 'tech', 'software', 'web', 'mobile', 'data', 'système', 'réseau'],
    'Finance': ['comptable', 'finance', 'banque', 'audit', 'comptabilité', 'économie', 'gestion'],
    'Marketing': ['marketing', 'communication', 'publicité', 'commercial', 'vente', 'digital'],
    'Santé': ['médecin', 'infirmier', 'pharmacien', 'santé', 'médical', 'dentiste'],
    'Éducation': ['professeur', 'enseignant', 'éducation', 'formation', 'école', 'université'],
    'Ingénierie': ['ingénieur', 'technique', 'mécanique', 'électrique', 'civil', 'industriel'],
    'Ressources Humaines': ['rh', 'ressources humaines', 'recrutement', 'hr'],
    'Juridique': ['avocat', 'juridique', 'droit', 'legal'],
    'Design': ['designer', 'graphique', 'ui', 'ux', 'créatif', 'design'],
    'Logistique': ['logistique', 'transport', 'supply chain', 'chaîne d\'approvisionnement']
  };

  const foundSectors = new Set<string>();

  jobTitles.forEach(title => {
    if (title) {
      const lowerTitle = title.toLowerCase();
      Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
          foundSectors.add(sector);
        }
      });
    }
  });

  return Array.from(foundSectors);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const experience = searchParams.get('experience') || '';
    const contractType = searchParams.get('contractType') || '';
    const sector = searchParams.get('sector') || '';
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db();

    let matchConditions: any = {};

    if (search) {
      matchConditions.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { "positions.title": { $regex: search, $options: 'i' } }
      ];
    }

    if (state) {
      matchConditions["companyLocation.state"] = state;
    }

    if (experience) {
      matchConditions["positions.requiredExperience"] = { $regex: experience, $options: 'i' };
    }

    if (contractType) {
      matchConditions["positions.contractType"] = contractType;
    }

    if (sector) {
      matchConditions.$or = matchConditions.$or || [];
      matchConditions.$or.push(
        { "positions.title": { $regex: sector, $options: 'i' } },
        { "positions.sector": { $regex: sector, $options: 'i' } }
      );
    }

    // استخدام Aggregation للربط مع جدول المستخدمين
    const offers = await db
      .collection('jobOffers')
      .aggregate([
        {
          $match: matchConditions
        },
        {
          $addFields: {
            userObjectId: { $toObjectId: "$userId" }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userObjectId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            positions: 1,
            companyLocation: 1,
            createdAt: 1,
            companyName: 1,
            userId: 1,
            userDetails: {
              avatar: { $ifNull: ["$userDetails.avatar", "/default-avatar.png"] },
              coverImage: { $ifNull: ["$userDetails.coverImage", "/default-cover.png"] }
            }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit }
      ])
      .toArray();

    // للتحقق من البيانات
    console.log('First offer example:', JSON.stringify(offers[0], null, 2));

    const total = await db
      .collection('jobOffers')
      .countDocuments(matchConditions);

    // استخراج البيانات الديناميكية للفلاتر
    const states = await db
      .collection('jobOffers')
      .distinct("companyLocation.state");

    // استخراج مستويات الخبرة الفعلية
    const experienceLevels = await db
      .collection('jobOffers')
      .distinct("positions.requiredExperience");

    // استخراج أنواع العقود (إذا كانت موجودة)
    const contractTypes = await db
      .collection('jobOffers')
      .distinct("positions.contractType");

    // استخراج القطاعات من عناوين الوظائف
    const jobTitles = await db
      .collection('jobOffers')
      .distinct("positions.title");

    // تجميع القطاعات الشائعة من عناوين الوظائف
    const sectors = extractSectorsFromTitles(jobTitles);

    return NextResponse.json({
      offers,
      filters: {
        states: states.sort(),
        experienceLevels: experienceLevels.filter(exp => exp && exp.trim() !== '').sort(),
        contractTypes: contractTypes.filter(type => type && type.trim() !== '').sort(),
        sectors: sectors.sort()
      },
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