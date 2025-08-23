-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "uniqueId" CHAR(5) NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueId_key" ON "public"."User"("uniqueId");
