import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="page">
      <AuthForm mode="register" />
      <p className="muted" style={{ textAlign: "center" }}>
        이미 가입했나요? <Link href="/login">로그인</Link>
      </p>
    </main>
  );
}
