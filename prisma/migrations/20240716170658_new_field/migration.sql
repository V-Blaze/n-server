-- CreateTable
CREATE TABLE "Referralw" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uplinkId" INTEGER,

    CONSTRAINT "Referralw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referralw_address_key" ON "Referralw"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Referralw_code_key" ON "Referralw"("code");

-- AddForeignKey
ALTER TABLE "Referralw" ADD CONSTRAINT "Referralw_uplinkId_fkey" FOREIGN KEY ("uplinkId") REFERENCES "Referralw"("id") ON DELETE SET NULL ON UPDATE CASCADE;
