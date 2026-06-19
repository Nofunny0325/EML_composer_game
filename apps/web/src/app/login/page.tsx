import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="page">
      <AuthForm mode="login" />
      <p className="muted" style={{ textAlign: "center" }}>
        No account yet? <Link href="/register">Register</Link>
      </p>
    </main>
  );
}

