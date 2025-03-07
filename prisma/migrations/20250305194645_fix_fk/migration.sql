-- DropForeignKey
ALTER TABLE "SleepData" DROP CONSTRAINT "SleepData_ownersleep_fkey";

-- AddForeignKey
ALTER TABLE "SleepData" ADD CONSTRAINT "SleepData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserApps"("owner") ON DELETE CASCADE ON UPDATE CASCADE;
