import { verifyRegistrationResponse } from "@simplewebauthn/server";
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const client = await clientPromise;
  const db = client.db();
  const { email, credential } = req.body || {};
  if (!email || !credential) {
    return res.status(400).json({ error: "Missing email or credential" });
  }

  const user = await db.collection("users").findOne({ email });
  if (!user?.currentChallenge) {
    return res.status(400).json({ error: "No challenge found" });
  }

  try {
    const verification = await verifyRegistrationResponse({
      credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: process.env.NEXTAUTH_URL,
      expectedRPID: process.env.WEBAUTHN_RP_ID,
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Verification failed" });
    }

    const info = verification.registrationInfo || {};
    const credentialRecord = {
      credentialID: toBase64Url(info.credentialID ?? info.credentialId),
      credentialPublicKey: toBase64Url(info.credentialPublicKey ?? info.publicKey),
      counter: info.counter ?? 0,
      transports: info.transports || [],
    };

    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          credentials: [...(user.credentials || []), credentialRecord],
          currentChallenge: null,
        },
      }
    );

    return res.json({ verified: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
