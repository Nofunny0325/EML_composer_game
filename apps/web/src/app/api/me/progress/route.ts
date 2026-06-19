import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rows = await prisma.userStageProgress.findMany({
    where: {
      userId: user.id,
      cleared: true
    },
    select: {
      stageId: true
    },
    orderBy: {
      stageId: "asc"
    }
  });

  return NextResponse.json({
    clearedStageIds: rows.map((row) => row.stageId)
  });
}
