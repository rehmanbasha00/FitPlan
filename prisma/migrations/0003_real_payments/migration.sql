CREATE TABLE "WalletPaymentOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "walletAccountId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerOrderId" TEXT NOT NULL,
  "providerPaymentId" TEXT,
  "amountPaise" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" TEXT NOT NULL DEFAULT 'created',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WalletPaymentOrder_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletPaymentOrder_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WalletPaymentOrder_providerOrderId_key" ON "WalletPaymentOrder"("providerOrderId");
CREATE UNIQUE INDEX "WalletPaymentOrder_providerPaymentId_key" ON "WalletPaymentOrder"("providerPaymentId");
CREATE INDEX "WalletPaymentOrder_userId_createdAt_idx" ON "WalletPaymentOrder"("userId", "createdAt");
