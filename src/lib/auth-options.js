import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/db";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      id: "webauthn",
      name: "Passkey",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({ email });
        if (!user) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};
