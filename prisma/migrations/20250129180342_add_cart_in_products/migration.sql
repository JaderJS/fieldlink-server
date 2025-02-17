-- AlterEnum
ALTER TYPE "OrderStatusType" ADD VALUE 'FINISHED';

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "status" "OrderStatusType" NOT NULL,
    "assignedCuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductsOnCart" (
    "cartId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnCart_pkey" PRIMARY KEY ("cartId","orderId")
);

-- AddForeignKey
ALTER TABLE "ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnCart" ADD CONSTRAINT "ProductsOnCart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
