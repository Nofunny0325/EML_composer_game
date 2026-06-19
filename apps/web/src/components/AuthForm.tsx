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
      setError("서버에 연결하지 못했습니다.");
      return;
    }

    const data = await readJsonResponse(res);

    if (!res.ok) {
      setError(data.error ?? "인증에 실패했습니다.");
      return;
    }

    localStorage.removeItem("eml_token");
    router.push("/app");
  }

  return (
    <form className="auth" onSubmit={onSubmit}>
      <div className="authHeader">
        <p className="eyebrow">EML 합성 게임</p>
        <h1>{mode === "login" ? "다시 시작하기" : "계정 만들기"}</h1>
        <p className="muted">
          {mode === "login"
            ? "로그인하면 스테이지 진행도를 이어서 플레이할 수 있습니다."
            : "클리어 기록과 최고 기록을 저장하려면 계정을 만들어 주세요."}
        </p>
      </div>

      {mode === "register" ? (
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="닉네임"
        />
      ) : null}

      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="이메일"
        type="email"
        required
      />

      <input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="비밀번호"
        type="password"
        required
      />

      {error ? <p className="result fail">{error}</p> : null}

      <button className="primary" type="submit">
        {mode === "login" ? "로그인" : "회원가입"}
      </button>
    </form>
  );
}

async function readJsonResponse(res: Response) {
  const text = await res.text();

  if (!text) {
    return { error: `서버 응답이 비어 있습니다. HTTP ${res.status}` };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 240) || `서버 응답 형식이 올바르지 않습니다. HTTP ${res.status}` };
  }
}
