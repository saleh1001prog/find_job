import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async session({ session, user }) {
      if (session?.user?.email) {
        const userRecord = await (await clientPromise)
          .db()
          .collection("users")
          .findOne({ email: session.user.email });
        
        if (userRecord) {
          (session.user as any).id = userRecord._id.toString();
        }
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (!account || !profile?.email) return false;

      const client = await clientPromise;
      const db = client.db();

      if (account.provider === "facebook" || account.provider === "google") {
        if (profile.email) {
          const existingUser = await db
            .collection("users")
            .findOne({ email: profile.email });

          if (!existingUser) {
            const newUser = await db.collection("users").insertOne({
              name: profile.name,
              email: profile.email,
              image: profile.image,
              isProfileComplete: false,
              userType: null,
              companyDetails: null,
            });

            await db.collection("accounts").insertOne({
              userId: new ObjectId(newUser.insertedId),
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              accessToken: account.access_token,
              refreshToken: account.refresh_token || null,
            });
          }
          return true;
        }
        return false;
      }
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 