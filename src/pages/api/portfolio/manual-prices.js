import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export default async function handler(req, res) {
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
    const rows = await db.collection("manual_prices").find({ user_id: userId }).toArray();
    return res.json({ manualPrices: rows });
  }
  if (req.method === "PUT") {
    const entries = Object.entries(req.body?.manualPrices || {});
    await db.collection("manual_prices").deleteMany({ user_id: userId });
    if (entries.length) {
      await db
        .collection("manual_prices")
        .insertMany(entries.map(([symbol, price]) => ({ ...price, symbol, user_id: userId })));
    }
    return res.json({ ok: true });
  }
  res.setHeader("Allow", "GET, PUT");
  return res.status(405).end();
}
