-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "storeName" TEXT NOT NULL DEFAULT 'Shopify Store',
    "score" INTEGER NOT NULL DEFAULT 0,
    "grade" TEXT NOT NULL DEFAULT 'C',
    "desktopShot" TEXT,
    "mobileShot" TEXT,
    "productShot" TEXT,
    "screenshots" TEXT NOT NULL DEFAULT '[]',
    "psiData" TEXT NOT NULL DEFAULT '{}',
    "findingsData" TEXT NOT NULL DEFAULT '[]',
    "categoryScores" TEXT NOT NULL DEFAULT '{}',
    "email" TEXT,
    "ipAddress" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "heroRewrites" TEXT,
    "productRewrites" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "ease" INTEGER NOT NULL DEFAULT 3,
    "priorityScore" INTEGER NOT NULL DEFAULT 9,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "fixSteps" TEXT NOT NULL,
    "screenshotBox" TEXT NOT NULL DEFAULT '{}',
    "pageType" TEXT NOT NULL DEFAULT 'homepage',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixOrder" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "storeUrl" TEXT NOT NULL,
    "collaboratorCode" TEXT,
    "packageType" TEXT NOT NULL DEFAULT 'fix_pack',
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 149.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixTask" (
    "id" TEXT NOT NULL,
    "fixOrderId" TEXT NOT NULL,
    "findingId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "ease" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assignedTo" TEXT,
    "beforeScreenshot" TEXT,
    "afterScreenshot" TEXT,
    "developerNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "paymentMethod" TEXT,
    "customerName" TEXT,
    "collaboratorCode" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_canonicalUrl_idx" ON "Audit"("canonicalUrl");

-- CreateIndex
CREATE INDEX "Audit_createdAt_idx" ON "Audit"("createdAt");

-- CreateIndex
CREATE INDEX "Audit_ipAddress_idx" ON "Audit"("ipAddress");

-- CreateIndex
CREATE INDEX "Finding_auditId_idx" ON "Finding"("auditId");

-- CreateIndex
CREATE INDEX "FixOrder_auditId_idx" ON "FixOrder"("auditId");

-- CreateIndex
CREATE INDEX "FixOrder_customerEmail_idx" ON "FixOrder"("customerEmail");

-- CreateIndex
CREATE INDEX "FixTask_fixOrderId_idx" ON "FixTask"("fixOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");

-- CreateIndex
CREATE INDEX "Order_auditId_idx" ON "Order"("auditId");

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "Order"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

-- CreateIndex
CREATE INDEX "RateLimit_key_idx" ON "RateLimit"("key");

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixOrder" ADD CONSTRAINT "FixOrder_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixTask" ADD CONSTRAINT "FixTask_fixOrderId_fkey" FOREIGN KEY ("fixOrderId") REFERENCES "FixOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixTask" ADD CONSTRAINT "FixTask_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
