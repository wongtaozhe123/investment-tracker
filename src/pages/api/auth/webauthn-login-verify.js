import { verifyAuthenticationResponse } from "@simplewebauthn/server";
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
  const { email, credential } = req.body || {};
  if (!email || !credential) {
    return res.status(400).json({ error: "Missing email or credential" });
  }

  const user = await db.collection("users").findOne({ email });
  if (!user?.currentChallenge || !user.credentials?.length) {
    return res.status(400).json({ error: "No challenge found" });
  }

  const incomingID = decodeCredentialID(credential.id);
  const credentialRecord =
    user.credentials.find((cred) => {
      const stored = decodeCredentialID(cred.credentialID);
      return stored && incomingID && stored.equals(incomingID);
    }) || user.credentials[0];

  try {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: process.env.NEXTAUTH_URL,
      expectedRPID: process.env.WEBAUTHN_RP_ID,
      credential: {
        id: decodeCredentialID(credentialRecord.credentialID),
        publicKey: decodeCredentialID(credentialRecord.credentialPublicKey),
        counter: credentialRecord.counter ?? 0,
        transports: credentialRecord.transports,
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Verification failed" });
    }

    const storedID = toBase64Url(credentialRecord.credentialID);
    const nextCredentials = user.credentials.map((cred) => {
      if (toBase64Url(cred.credentialID) !== storedID) return cred;
      return { ...cred, counter: verification.authenticationInfo.newCounter };
    });

    await db.collection("users").updateOne(
      { email },
      { $set: { credentials: nextCredentials, currentChallenge: null } }
    );

    return res.json({ verified: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
