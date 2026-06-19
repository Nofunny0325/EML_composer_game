import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().max(80).optional()
});

export async function POST(req: Request) {
  const parsed = RegisterSchema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration data." }, { status: 400 });
  }

  try {
    const exists = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (exists) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        displayName: parsed.data.displayName
      }
    });

    return NextResponse.json({
      token: signToken(user.id),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    console.error("Register failed", error);

    return NextResponse.json(
      {
        error:
          "Database connection failed. Check DATABASE_URL in apps/web/.env and restart the server."
      },
      { status: 500 }
    );
  }
}
