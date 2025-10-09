-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "isBudget" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderStatusId" INTEGER;

-- CreateTable
CREATE TABLE "public"."order_status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "order_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_status_name_key" ON "public"."order_status"("name");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_orderStatusId_fkey" FOREIGN KEY ("orderStatusId") REFERENCES "public"."order_status"("id") ON DELETE SET NULL ON UPDATE CASCADE;
