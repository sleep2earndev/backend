/*
  Warnings:

  - A unique constraint covering the columns `[startTime]` on the table `SleepData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `earning` to the `SleepData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `SleepData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `SleepData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `SleepData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `SleepData` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "version" AS ENUM ('ONE', 'TWO');

-- DropIndex
DROP INDEX "SleepData_dateOfSleep_key";

-- AlterTable
ALTER TABLE "SleepData" ADD COLUMN     "earning" INTEGER NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "summary" JSONB NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ADD COLUMN     "version" "version" NOT NULL;

-- CreateTable
CREATE TABLE "totalEarning" (
    "userId" TEXT NOT NULL,
    "totalEarn" INTEGER NOT NULL,

    CONSTRAINT "totalEarning_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "totalEarning_userId_key" ON "totalEarning"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SleepData_startTime_key" ON "SleepData"("startTime");
