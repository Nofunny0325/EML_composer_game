import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, signToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/request";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128)
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limited = checkRateLimit(`login:${ip}`, 10, 60_000);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: `로그인 시도가 너무 많습니다. ${limited.retryAfterSeconds}초 뒤에 다시 시도하세요.` },
      {
        headers: { "retry-after": String(limited.retryAfterSeconds) },
        status: 429
      }
    );
  }

  let body: unknown;

  try {
    body = await readJsonBody(req);
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "이메일 또는 비밀번호 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (!user) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 맞지 않습니다." }, { status: 401 });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!ok) {
      return NextResponse.json({ error: "이메일 또는 비밀번호가 맞지 않습니다." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });

    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      name: SESSION_COOKIE_NAME,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      value: signToken(user.id)
    });

    return response;
  } catch (error) {
    console.error("Login failed", error);

    return NextResponse.json(
      {
        error:
          "서버가 DB에 연결하지 못했습니다. DATABASE_URL 설정을 확인해 주세요."
      },
      { status: 500 }
    );
  }
}
