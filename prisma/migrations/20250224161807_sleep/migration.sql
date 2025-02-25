/*
  Warnings:

  - You are about to drop the column `id` on the `UserApps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[owner]` on the table `UserApps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner` to the `UserApps` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserApps_id_key";

-- AlterTable
ALTER TABLE "UserApps" DROP COLUMN "id",
ADD COLUMN     "owner" TEXT NOT NULL,
ADD CONSTRAINT "UserApps_pkey" PRIMARY KEY ("owner");

-- CreateTable
CREATE TABLE "SleepData" (
    "idSleep" SERIAL NOT NULL,
    "dateOfSleep" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "claimInfo" JSONB NOT NULL,
    "signedClaim" JSONB NOT NULL,
    "signatures" TEXT NOT NULL,
    "ownersleep" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SleepData_idSleep_key" ON "SleepData"("idSleep");

-- CreateIndex
CREATE UNIQUE INDEX "UserApps_owner_key" ON "UserApps"("owner");

-- AddForeignKey
ALTER TABLE "SleepData" ADD CONSTRAINT "SleepData_ownersleep_fkey" FOREIGN KEY ("ownersleep") REFERENCES "UserApps"("owner") ON DELETE CASCADE ON UPDATE CASCADE;
