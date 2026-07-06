"use client";

// ⚠️ SPIKE — THROWAWAY. Bare test harness to prove three things and nothing more:
//   (a) sign-up + sign-in via Convex Auth (Password provider)
//   (b) session persistence across reload + tab close/reopen
//   (c) two-sender live message rendering via Convex reactive queries
// No design system, no shared components, intentionally ugly. Delete after the spike.
import { FormEvent, useState } from "react";
import { Authenticated, Unauthenticated, AuthLoading, useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { makeFunctionReference } from "convex/server";

// Reference the Convex functions by name so this file needs NO convex/_generated
// (which can't be generated without a logged-in deployment). Untyped on purpose — spike.
const listRef = makeFunctionReference<"query">("spikeMessages:list");
const sendRef = makeFunctionReference<"mutation">("spikeMessages:send");

function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signUp" | "signIn">("signUp");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <h2>{flow === "signUp" ? "Sign up" : "Sign in"}</h2>
      <input name="email" type="email" placeholder="email" autoComplete="username" required />
      <input name="password" type="password" placeholder="password" autoComplete="current-password" required />
      <button type="submit">{flow === "signUp" ? "Create account" : "Sign in"}</button>
      <button type="button" onClick={() => setFlow(flow === "signUp" ? "signIn" : "signUp")}>
        {flow === "signUp" ? "Have an account? Sign in" : "Need an account? Sign up"}
      </button>
      {error ? <p style={{ color: "crimson" }}>Error: {error}</p> : null}
    </form>
  );
}

function Chat() {
  const { signOut } = useAuthActions();
  const messages = useQuery(listRef) as Array<{ _id: string; authorEmail: string; body: string }> | undefined;
  const send = useMutation(sendRef);
  const [text, setText] = useState("");

  async function onSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    await send({ body: text });
    setText("");
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <button onClick={() => void signOut()}>Sign out</button>
      <h2>Live chat (reactive)</h2>
      <ul style={{ border: "1px solid #ccc", padding: 8, minHeight: 160 }}>
        {messages === undefined ? (
          <li>loading…</li>
        ) : messages.length === 0 ? (
          <li>(no messages yet)</li>
        ) : (
          messages.map((m) => (
            <li key={m._id}>
              <b>{m.authorEmail}:</b> {m.body}
            </li>
          ))
        )}
      </ul>
      <form onSubmit={onSend} style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="type a message" style={{ flex: 1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default function SpikePage() {
  return (
    <main style={{ fontFamily: "monospace", padding: 24, display: "grid", gap: 16 }}>
      <p style={{ background: "#fee", padding: 8 }}>
        ⚠️ Convex spike — throwaway test harness. Not real app UI.
      </p>
      <AuthLoading>
        <p>Loading auth…</p>
      </AuthLoading>
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <Authenticated>
        <Chat />
      </Authenticated>
    </main>
  );
}
