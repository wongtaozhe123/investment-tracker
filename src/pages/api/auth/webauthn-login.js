import { generateAuthenticationOptions } from "@simplewebauthn/server";
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

function decodeCredentialID(id) {
  if (!id) return null;
  if (typeof id === "string") return Buffer.from(id, "base64url");
  if (id instanceof Uint8Array) return Buffer.from(id);
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const client = await clientPromise;
  const db = client.db();
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = await db.collection("users").findOne({ email });
  if (!user || !user.credentials?.length) {
    return res.status(404).json({ error: "No passkey is registered for this email yet" });
  }

  const options = await generateAuthenticationOptions({
    rpID: process.env.WEBAUTHN_RP_ID || "localhost",
    allowCredentials: user.credentials.map((cred) => ({
      id: decodeCredentialID(cred.credentialID),
      transports: cred.transports,
    })),
    userVerification: "preferred",
  });

  await db.collection("users").updateOne(
    { email },
    { $set: { currentChallenge: toBase64Url(options.challenge) } }
  );

  res.json(options);
}
