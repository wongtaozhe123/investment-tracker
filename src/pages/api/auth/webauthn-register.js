import { generateRegistrationOptions } from "@simplewebauthn/server";
import { randomUUID } from "node:crypto";
import clientPromise from "@/lib/db";

function toBase64Url(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Uint8Array) {
    let binary = "";
    for (let i = 0; i < value.byteLength; i += 1) {
      binary += String.fromCharCode(value[i]);
    }
    return Buffer.from(binary, "binary").toString("base64url");
  }
  if (value.buffer) {
    return toBase64Url(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
  }
  return null;
}

// `generateRegistrationOptions` requires a `Uint8Array` for `userID` now.
// We persist the raw buffer alongside the user so logins can reuse the same ID.
function ensureUserID(user) {
  if (user?.userID && user.userID instanceof Uint8Array) return user.userID;
  if (user?.userID && typeof user.userID === "string") {
    return new Uint8Array(Buffer.from(user.userID, "base64url"));
  }
  return new Uint8Array(Buffer.from(randomUUID().replace(/-/g, ""), "hex"));
}

function persistableUserID(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const client = await clientPromise;
  const db = client.db();
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await db.collection("users").findOne({ email });
  const userID = ensureUserID(user);

  const options = await generateRegistrationOptions({
    rpID: process.env.WEBAUTHN_RP_ID || "localhost",
    rpName: process.env.WEBAUTHN_RP_NAME || "Investment Tracker",
    userID,
    userName: user?.name || name || email,
    userDisplayName: user?.name || name || email,
  });

  await db.collection("users").updateOne(
    { email },
    {
      $set: {
        userID: persistableUserID(userID),
        currentChallenge: toBase64Url(options.challenge),
      },
      $setOnInsert: { email, name: name || null, createdAt: new Date() },
    },
    { upsert: true }
  );

  res.json(options);
}
