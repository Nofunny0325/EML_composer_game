import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { getAvailableBlocks } from "@/lib/blocks";
import { assertCompositionNode, collectBlockIds, countNodes, maxDepth } from "@/lib/emlMetrics";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { readJsonBody } from "@/lib/request";
import { verifyEmlSubmission } from "@/lib/verifyEmlSubmission";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const limited = checkRateLimit(`clear:${user.id}:${getClientIp(req)}`, 30, 60_000);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: `제출이 너무 많습니다. ${limited.retryAfterSeconds}초 뒤에 다시 시도하세요.` },
      {
        headers: { "retry-after": String(limited.retryAfterSeconds) },
        status: 429
      }
    );
  }

  const { id } = await ctx.params;
  const stageId = Number(id);

  if (!Number.isInteger(stageId) || stageId < 1) {
    return NextResponse.json({ error: "스테이지 번호가 올바르지 않습니다." }, { status: 400 });
  }

  let body: Record<string, unknown>;

  try {
    const parsedBody = await readJsonBody(req, 80_000);
    body = parsedBody && typeof parsedBody === "object" ? parsedBody as Record<string, unknown> : {};
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    assertCompositionNode(body.expressionTree);
  } catch {
    return NextResponse.json({ error: "합성 트리 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const stage = await prisma.stage.findUnique({
    where: { id: stageId }
  });

  if (!stage) {
    return NextResponse.json({ error: "스테이지를 찾을 수 없습니다." }, { status: 404 });
  }

  const clearedRows = await prisma.userStageProgress.findMany({
    where: {
      userId: user.id,
      cleared: true
    },
    select: {
      stageId: true
    }
  });

  const maxCleared = clearedRows.reduce(
    (max, row) => Math.max(max, row.stageId),
    0
  );

  if (stageId > maxCleared + 1) {
    return NextResponse.json({ error: "아직 잠긴 스테이지입니다." }, { status: 403 });
  }

  const nodeCount = countNodes(body.expressionTree);
  const depth = maxDepth(body.expressionTree);

  if (nodeCount > 600 || depth > 80) {
    return NextResponse.json({ error: "식이 너무 큽니다." }, { status: 400 });
  }

  const allowed = new Set(getAvailableBlocks(stageId).map((block) => block.id));
  const used = Array.from(new Set(collectBlockIds(body.expressionTree)));
  const disallowed = used.filter((blockId) => !allowed.has(blockId));

  if (disallowed.length > 0) {
    return NextResponse.json(
      { error: `아직 해금되지 않은 블록이 사용되었습니다: ${disallowed.join(", ")}` },
      { status: 400 }
    );
  }

  const result = await verifyEmlSubmission({
    tree: body.expressionTree,
    targetFunction: stage.targetFunction
  });

  if (!result.equivalent) {
    return NextResponse.json({
      cleared: false,
      reason: result.reason ?? "선택한 블록이 아직 목표 함수와 같지 않습니다."
    });
  }

  await prisma.userStageProgress.upsert({
    where: {
      userId_stageId: {
        userId: user.id,
        stageId
      }
    },
    create: {
      userId: user.id,
      stageId,
      cleared: true,
      bestNodeCount: nodeCount,
      bestDepth: depth,
      bestTimeMs: Number.isFinite(body.timeMs) ? Number(body.timeMs) : null,
      bestExpression: JSON.stringify(body.expressionTree),
      clearedAt: new Date()
    },
    update: {
      cleared: true,
      bestNodeCount: nodeCount,
      bestDepth: depth,
      bestTimeMs: Number.isFinite(body.timeMs) ? Number(body.timeMs) : null,
      bestExpression: JSON.stringify(body.expressionTree),
      clearedAt: new Date()
    }
  });

  return NextResponse.json({
    cleared: true,
    method: result.method,
    expression: result.expression,
    target: result.target
  });
}
