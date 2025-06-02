import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // استخراج جميع البيانات للفلاتر
    const [states, experienceLevels, contractTypes, jobTitles] = await Promise.all([
      db.collection('jobOffers').distinct("companyLocation.state"),
      db.collection('jobOffers').distinct("positions.requiredExperience"),
      db.collection('jobOffers').distinct("positions.contractType"),
      db.collection('jobOffers').distinct("positions.title")
    ]);

    // تجميع القطاعات من عناوين الوظائف
    const sectors = extractSectorsFromTitles(jobTitles);

    // حساب عدد العروض لكل فلتر
    const statesWithCounts = await Promise.all(
      states.map(async (state) => {
        const count = await db.collection('jobOffers').countDocuments({
          "companyLocation.state": state
        });
        return { value: state, count };
      })
    );

    const experienceWithCounts = await Promise.all(
      experienceLevels.filter(exp => exp && exp.trim() !== '').map(async (exp) => {
        const count = await db.collection('jobOffers').countDocuments({
          "positions.requiredExperience": exp
        });
        return { value: exp, count };
      })
    );

    const contractTypesWithCounts = await Promise.all(
      contractTypes.filter(type => type && type.trim() !== '').map(async (type) => {
        const count = await db.collection('jobOffers').countDocuments({
          "positions.contractType": type
        });
        return { value: type, count };
      })
    );

    const sectorsWithCounts = await Promise.all(
      sectors.map(async (sector) => {
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

        const keywords = sectorKeywords[sector as keyof typeof sectorKeywords] || [];
        const regexPattern = keywords.join('|');
        
        const count = await db.collection('jobOffers').countDocuments({
          "positions.title": { $regex: regexPattern, $options: 'i' }
        });
        
        return { value: sector, count };
      })
    );

    return NextResponse.json({
      filters: {
        states: statesWithCounts.sort((a, b) => a.value.localeCompare(b.value)),
        experienceLevels: experienceWithCounts.sort((a, b) => a.value.localeCompare(b.value)),
        contractTypes: contractTypesWithCounts.sort((a, b) => a.value.localeCompare(b.value)),
        sectors: sectorsWithCounts.sort((a, b) => b.count - a.count) // ترتيب حسب العدد
      },
      summary: {
        totalOffers: await db.collection('jobOffers').countDocuments(),
        totalStates: states.length,
        totalExperienceLevels: experienceLevels.filter(exp => exp && exp.trim() !== '').length,
        totalContractTypes: contractTypes.filter(type => type && type.trim() !== '').length,
        totalSectors: sectors.length
      }
    });

  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
