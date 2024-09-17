-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAddress" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staker" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "Staker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "uplinkId" INTEGER,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralPayout" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "ReferralPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAddress_address_key" ON "AdminAddress"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Staker_uuid_key" ON "Staker"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletId_key" ON "User"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_address_key" ON "Referral"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- AddForeignKey
ALTER TABLE "AdminAddress" ADD CONSTRAINT "AdminAddress_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_uplinkId_fkey" FOREIGN KEY ("uplinkId") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;
