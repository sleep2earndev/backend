/*
  Warnings:

  - Added the required column `logId` to the `SleepData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SleepData" ADD COLUMN     "logId" TEXT NOT NULL;
