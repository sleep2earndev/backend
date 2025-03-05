/*
  Warnings:

  - You are about to alter the column `earning` on the `SleepData` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "SleepData" ALTER COLUMN "earning" SET DATA TYPE DECIMAL(65,30);
