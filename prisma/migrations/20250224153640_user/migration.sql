-- CreateTable
CREATE TABLE "UserApps" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "claimInfo" JSONB NOT NULL,
    "signedClaim" JSONB NOT NULL,
    "signatures" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserApps_id_key" ON "UserApps"("id");
