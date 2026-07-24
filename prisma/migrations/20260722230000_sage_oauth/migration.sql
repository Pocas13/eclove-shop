CREATE TABLE "SageConnection" (
    "id" TEXT NOT NULL DEFAULT 'principal',
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "businessId" TEXT,
    "businessName" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SageConnection_pkey" PRIMARY KEY ("id")
);
