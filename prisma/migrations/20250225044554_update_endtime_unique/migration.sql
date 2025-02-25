/*
  Warnings:

  - A unique constraint covering the columns `[endTime]` on the table `SleepData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SleepData_endTime_key" ON "SleepData"("endTime");
