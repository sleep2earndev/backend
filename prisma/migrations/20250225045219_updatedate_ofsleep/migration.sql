/*
  Warnings:

  - A unique constraint covering the columns `[dateOfSleep]` on the table `SleepData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SleepData" ALTER COLUMN "dateOfSleep" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SleepData_dateOfSleep_key" ON "SleepData"("dateOfSleep");
