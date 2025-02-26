/*
  Warnings:

  - Added the required column `fullName` to the `totalEarning` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "totalEarning" ADD COLUMN     "fullName" TEXT NOT NULL;
