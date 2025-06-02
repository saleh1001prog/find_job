'use server';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

export async function getJobOffer(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const jobOffer = await db.collection("jobOffers").findOne({
      _id: new ObjectId(id)
    });

    if (!jobOffer) {
      return null;
    }

    return {
      ...jobOffer,
      _id: jobOffer._id.toString()
    };
  } catch (error) {
    console.error("Error fetching job offer:", error);
    return null;
  }
} 