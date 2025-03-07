/*
  Warnings:

  - A unique constraint covering the columns `[logId]` on the table `SleepData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SleepData_logId_key" ON "SleepData"("logId");
