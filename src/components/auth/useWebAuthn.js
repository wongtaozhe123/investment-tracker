"use client";

import { useCallback, useState } from "react";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";

// Reads the body of `resp` as JSON. We pass `alreadyRead` when the caller has
// already consumed the body for an error message; in that case we return the
// pre-parsed body so the success path can keep moving.
const readJson = async (resp, alreadyRead = null) => {
  if (alreadyRead) return alreadyRead;
  try {
    return await resp.json();
  } catch {
    return null;
  }
};

export function useWebAuthn() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const register = useCallback(async (email) => {
    setError(null);
    setStatus("registering");
    try {
      const resp = await fetch("/api/auth/webauthn-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always buffer the body so we can both inspect errors and feed the
      // success payload to startRegistration without racing the Response stream.
      const body = await readJson(resp);
      if (!resp.ok) {
        throw new Error(body?.error || `Could not start registration (${resp.status})`);
      }
      if (!body || typeof body !== "object") {
        throw new Error("Registration options were empty");
      }
      const credential = await startRegistration({ optionsJSON: body });
      const verifyResp = await fetch("/api/auth/webauthn-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, credential }),
      });
      if (!verifyResp.ok) {
        const verifyBody = await readJson(verifyResp);
        throw new Error(verifyBody?.error || "Could not finish registration");
      }
      setStatus("registered");
      return true;
    } catch (err) {
      setError(err?.message || "Registration failed");
      setStatus("idle");
      return false;
    }
  }, []);

  const login = useCallback(async (email) => {
    setError(null);
    setStatus("authenticating");
    try {
      const challengeResp = await fetch("/api/auth/webauthn-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await readJson(challengeResp);
      if (!challengeResp.ok) {
        throw new Error(options?.error || "Could not start sign in");
      }
      if (!options || typeof options !== "object") {
        throw new Error("Sign in options were empty");
      }
      const credential = await startAuthentication({ optionsJSON: options });
      const verifyResp = await fetch("/api/auth/webauthn-login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, credential }),
      });
      if (!verifyResp.ok) {
        const body = await readJson(verifyResp);
        throw new Error(body?.error || "Could not finish sign in");
      }
      const result = await signIn("webauthn", { email, callbackUrl: "/dashboard", redirect: false });
      if (result?.error) throw new Error(result.error);
      setStatus("authenticated");
      return true;
    } catch (err) {
      setError(err?.message || "Sign in failed");
      setStatus("idle");
      return false;
    }
  }, []);

  return { register, login, status, error, reset };
}
