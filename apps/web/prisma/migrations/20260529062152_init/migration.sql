-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "targetFunction" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserStageProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "cleared" BOOLEAN NOT NULL DEFAULT false,
    "bestNodeCount" INTEGER,
    "bestDepth" INTEGER,
    "bestTimeMs" INTEGER,
    "bestExpression" TEXT,
    "clearedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserStageProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserStageProgress_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserStageProgress_userId_idx" ON "UserStageProgress"("userId");

-- CreateIndex
CREATE INDEX "UserStageProgress_stageId_idx" ON "UserStageProgress"("stageId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStageProgress_userId_stageId_key" ON "UserStageProgress"("userId", "stageId");
