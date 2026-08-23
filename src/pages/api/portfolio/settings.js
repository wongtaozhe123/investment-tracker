import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not signed in" });
    }
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userId = user._id.toString();

    if (req.method === "GET") {
      const settings = (await db.collection("settings").findOne({ user_id: userId })) || {
        user_id: userId,
        currency: "SGD",
      };
      return res.json({ settings });
    }
    if (req.method === "PUT") {
      const { _id, ...rest } = req.body || {};
      const next = { ...rest, user_id: userId };
      await db
        .collection("settings")
        .updateOne({ user_id: userId }, { $set: next }, { upsert: true });
      return res.json({ settings: next });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).end();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
