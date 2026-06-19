import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { getAvailableBlocks } from "@/lib/blocks";
import { assertCompositionNode, collectBlockIds, countNodes, maxDepth } from "@/lib/emlMetrics";
import { verifyEmlSubmission } from "@/lib/verifyEmlSubmission";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const stageId = Number(id);

  if (!Number.isInteger(stageId) || stageId < 1) {
    return NextResponse.json({ error: "Invalid stage id." }, { status: 400 });
  }

  const body = await req.json();

  try {
    assertCompositionNode(body.expressionTree);
  } catch {
    return NextResponse.json({ error: "Invalid composition tree." }, { status: 400 });
  }

  const stage = await prisma.stage.findUnique({
    where: { id: stageId }
  });

  if (!stage) {
    return NextResponse.json({ error: "Stage not found." }, { status: 404 });
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
    return NextResponse.json({ error: "Stage is locked." }, { status: 403 });
  }

  const nodeCount = countNodes(body.expressionTree);
  const depth = maxDepth(body.expressionTree);

  if (nodeCount > 600 || depth > 80) {
    return NextResponse.json({ error: "Expression is too large." }, { status: 400 });
  }

  const allowed = new Set(getAvailableBlocks(stageId).map((block) => block.id));
  const used = Array.from(new Set(collectBlockIds(body.expressionTree)));
  const disallowed = used.filter((blockId) => !allowed.has(blockId));

  if (disallowed.length > 0) {
    return NextResponse.json(
      { error: `Locked block used: ${disallowed.join(", ")}` },
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
      reason: result.reason ?? "Submitted tree is not equivalent."
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
