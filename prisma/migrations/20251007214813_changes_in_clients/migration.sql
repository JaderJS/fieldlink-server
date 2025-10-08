-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "docId" TEXT;

-- CreateTable
CREATE TABLE "public"."clients_more_infos" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_more_infos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_more_infos_clientId_key" ON "public"."clients_more_infos"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_more_infos_email_key" ON "public"."clients_more_infos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_more_infos_phone_key" ON "public"."clients_more_infos"("phone");

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_docId_fkey" FOREIGN KEY ("docId") REFERENCES "public"."Doc"("cuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clients_more_infos" ADD CONSTRAINT "clients_more_infos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
