/*
  Warnings:

  - You are about to drop the column `signatures` on the `SleepData` table. All the data in the column will be lost.
  - You are about to drop the column `signedClaim` on the `SleepData` table. All the data in the column will be lost.
  - You are about to drop the column `signatures` on the `UserApps` table. All the data in the column will be lost.
  - You are about to drop the column `signedClaim` on the `UserApps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SleepData" DROP COLUMN "signatures",
DROP COLUMN "signedClaim";

-- AlterTable
ALTER TABLE "UserApps" DROP COLUMN "signatures",
DROP COLUMN "signedClaim";
