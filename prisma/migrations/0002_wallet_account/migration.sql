CREATE TABLE "WalletAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "walletHandle" TEXT NOT NULL,
  "qrPayload" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "balancePaise" BIGINT NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WalletAccount_userId_key" ON "WalletAccount"("userId");
CREATE UNIQUE INDEX "WalletAccount_walletHandle_key" ON "WalletAccount"("walletHandle");
CREATE UNIQUE INDEX "WalletAccount_qrPayload_key" ON "WalletAccount"("qrPayload");
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "WalletTransaction" (
  "id" TEXT NOT NULL,
  "walletAccountId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "amountPaise" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "provider" TEXT,
  "providerTransactionId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WalletTransaction_providerTransactionId_key" ON "WalletTransaction"("providerTransactionId");
CREATE UNIQUE INDEX "WalletTransaction_idempotencyKey_key" ON "WalletTransaction"("idempotencyKey");
CREATE INDEX "WalletTransaction_walletAccountId_createdAt_idx" ON "WalletTransaction"("walletAccountId", "createdAt");
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
