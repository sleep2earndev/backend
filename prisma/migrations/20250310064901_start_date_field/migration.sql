/*
  Warnings:

  - Added the required column `endDate` to the `SleepData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `SleepData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SleepData" ADD COLUMN     "endDate" TEXT NOT NULL,
ADD COLUMN     "startDate" TEXT NOT NULL;
