import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

const sanitize = (holding) => {
  if (!holding || typeof holding !== "object") return null;
  const symbol = String(holding.symbol || "").trim().toUpperCase();
  const type = ["stock", "etf", "crypto"].includes(holding.type) ? holding.type : "stock";
  const quantity = Number(holding.quantity);
  if (!symbol || !Number.isFinite(quantity) || quantity <= 0) return null;
  return {
    id: holding.id || `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    symbol,
    quantity,
    pricePaid: Number(holding.pricePaid) || 0,
    priceCurrency: String(holding.priceCurrency || "SGD").toUpperCase(),
    dateBought: holding.dateBought || new Date().toISOString().slice(0, 10),
    createdAt: new Date(),
  };
};

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
    const holdings = await db.collection("holdings").find({ user_id: userId }).toArray();
    return res.json({ holdings });
  }

  if (req.method === "POST") {
    const incoming = Array.isArray(req.body?.holdings)
      ? req.body.holdings
      : req.body?.holding
      ? [req.body.holding]
      : [];

    const cleaned = incoming
      .map(sanitize)
      .filter(Boolean)
      .map((h) => ({ ...h, user_id: userId }));

    if (!cleaned.length) {
      return res.status(400).json({ error: "No valid holdings supplied" });
    }

    // Allow callers to either replace the full list (`replaceAll: true`) or
    // append a single holding. Default behaviour: append.
    if (req.body?.replaceAll) {
      await db.collection("holdings").deleteMany({ user_id: userId });
      await db.collection("holdings").insertMany(cleaned);
    } else if (cleaned.length === 1) {
      await db.collection("holdings").insertOne(cleaned[0]);
    } else {
      await db.collection("holdings").insertMany(cleaned);
    }
    return res.json({ ok: true, holdings: cleaned });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: "Holding id is required" });
    await db.collection("holdings").deleteOne({ user_id: userId, id });
    return res.json({ ok: true });
  }

  if (req.method === "PUT") {
    const { id, quantity } = req.body || {};
    if (!id) return res.status(400).json({ error: "Holding id is required" });
    const update = {};
    if (quantity != null) {
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
      update.quantity = qty;
    }
    if (!Object.keys(update).length) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    await db.collection("holdings").updateOne(
      { user_id: userId, id },
      { $set: update }
    );
    return res.json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE");
  return res.status(405).end();
}
