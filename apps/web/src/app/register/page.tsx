import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="page">
      <AuthForm mode="register" />
      <p className="muted" style={{ textAlign: "center" }}>
        Already registered? <Link href="/login">Login</Link>
      </p>
    </main>
  );
}

