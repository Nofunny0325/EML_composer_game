import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/auth";

export async function getCurrentUser(req: Request) {
  const token = getBearerToken(req) ?? getCookieToken(req);

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);

    return prisma.user.findUnique({
      where: { id: payload.sub }
    });
  } catch {
    return null;
  }
}

function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

function getCookieToken(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) {
    return null;
  }

  return decodeURIComponent(sessionCookie.slice(SESSION_COOKIE_NAME.length + 1));
}
