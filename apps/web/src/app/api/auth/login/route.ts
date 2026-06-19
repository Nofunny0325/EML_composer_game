import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: Request) {
  const parsed = LoginSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login data." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json({
      token: signToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error("Login failed", error);

    return NextResponse.json(
      {
        error:
          "Database connection failed. Check DATABASE_URL in apps/web/.env and restart the server."
      },
      { status: 500 }
    );
  }
}
