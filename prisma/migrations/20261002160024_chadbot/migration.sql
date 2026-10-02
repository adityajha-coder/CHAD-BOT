-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spice" INTEGER,
    "ignored" BOOLEAN NOT NULL DEFAULT false,
    "roastedCount" INTEGER NOT NULL DEFAULT 0,
    "hypedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "style" TEXT NOT NULL DEFAULT 'fun',
    "autoRoast" BOOLEAN NOT NULL DEFAULT false,
    "reactions" BOOLEAN NOT NULL DEFAULT false,
    "gifs" BOOLEAN NOT NULL DEFAULT false,
    "revive" BOOLEAN NOT NULL DEFAULT false,
    "lastHumanAt" DATETIME,
    "lastReviveAt" DATETIME
);

-- CreateTable
CREATE TABLE "Fact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RoastLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecentMsg" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Quota" (
    "key" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("key", "day")
);

-- CreateTable
CREATE TABLE "Meta" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Fact_userId_idx" ON "Fact"("userId");

-- CreateIndex
CREATE INDEX "RoastLog_userId_idx" ON "RoastLog"("userId");

-- CreateIndex
CREATE INDEX "RecentMsg_userId_idx" ON "RecentMsg"("userId");
