import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="page">
      <AuthForm mode="login" />
      <p className="muted" style={{ textAlign: "center" }}>
        아직 계정이 없나요? <Link href="/register">회원가입</Link>
      </p>
    </main>
  );
}
