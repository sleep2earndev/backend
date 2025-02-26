/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `SleepData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SleepData_userId_key" ON "SleepData"("userId");
