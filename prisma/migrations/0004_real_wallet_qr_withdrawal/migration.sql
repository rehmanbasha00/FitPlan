ALTER TABLE "WalletPaymentOrder" ADD COLUMN "providerQrId" TEXT;
ALTER TABLE "WalletPaymentOrder" ADD COLUMN "providerQrImageUrl" TEXT;
CREATE UNIQUE INDEX "WalletPaymentOrder_providerQrId_key" ON "WalletPaymentOrder"("providerQrId");

CREATE TABLE "WalletWithdrawal" (
  "id" TEXT NOT NULL,
  "walletAccountId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amountPaise" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "destinationType" TEXT NOT NULL DEFAULT 'upi',
  "destination" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "provider" TEXT,
  "providerPayoutId" TEXT,
  "providerFundAccountId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WalletWithdrawal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletWithdrawal_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WalletWithdrawal_providerPayoutId_key" ON "WalletWithdrawal"("providerPayoutId");
CREATE UNIQUE INDEX "WalletWithdrawal_idempotencyKey_key" ON "WalletWithdrawal"("idempotencyKey");
CREATE INDEX "WalletWithdrawal_userId_createdAt_idx" ON "WalletWithdrawal"("userId", "createdAt");
CREATE INDEX "WalletWithdrawal_walletAccountId_createdAt_idx" ON "WalletWithdrawal"("walletAccountId", "createdAt");
