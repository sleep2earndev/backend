/*
  Warnings:

  - Changed the type of `logId` on the `SleepData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SleepData" DROP COLUMN "logId",
ADD COLUMN     "logId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SleepData_logId_key" ON "SleepData"("logId");
