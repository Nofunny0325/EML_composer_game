"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    let res: Response;

    try {
      res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: mode === "register" ? displayName : undefined
        })
      });
    } catch {
      setError("Could not connect to the server.");
      return;
    }

    const data = await readJsonResponse(res);

    if (!res.ok) {
      setError(data.error ?? "Authentication failed.");
      return;
    }

    localStorage.setItem("eml_token", data.token);
    router.push("/app");
  }

  return (
    <form className="auth" onSubmit={onSubmit}>
      <div className="authHeader">
        <p className="eyebrow">EML Composer</p>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="muted">
          {mode === "login"
            ? "Sign in to continue your stage progress."
            : "Start saving clears and best attempts."}
        </p>
      </div>

      {mode === "register" ? (
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Display name"
        />
      ) : null}

      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        type="email"
        required
      />

      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        type="password"
        required
      />

      {error ? <p className="result fail">{error}</p> : null}

      <button className="primary" type="submit">
        {mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}

async function readJsonResponse(res: Response) {
  const text = await res.text();

  if (!text) {
    return { error: `Empty response from server. HTTP ${res.status}` };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) || `Invalid server response. HTTP ${res.status}` };
  }
}
