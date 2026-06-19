import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function getCurrentUser(req: Request) {
  const header = req.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);

    return prisma.user.findUnique({
      where: { id: payload.sub }
    });
  } catch {
    return null;
  }
}

