-- CreateTable
CREATE TABLE "Order_" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "docCuid" TEXT,

    CONSTRAINT "Order__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductsOnSales" (
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnSales_pkey" PRIMARY KEY ("saleId","productId")
);

-- CreateTable
CREATE TABLE "Product_" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Product__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work_" (
    "id" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,
    "docCuid" TEXT,

    CONSTRAINT "Work__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherValue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OtherValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SaleToWork_" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SaleToWork__AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SaleToWork__B_index" ON "_SaleToWork_"("B");

-- AddForeignKey
ALTER TABLE "Order_" ADD CONSTRAINT "Order__docCuid_fkey" FOREIGN KEY ("docCuid") REFERENCES "Doc"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnSales" ADD CONSTRAINT "ProductsOnSales_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnSales" ADD CONSTRAINT "ProductsOnSales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_" ADD CONSTRAINT "Work__orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work_" ADD CONSTRAINT "Work__docCuid_fkey" FOREIGN KEY ("docCuid") REFERENCES "Doc"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork_" ADD CONSTRAINT "_SaleToWork__A_fkey" FOREIGN KEY ("A") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleToWork_" ADD CONSTRAINT "_SaleToWork__B_fkey" FOREIGN KEY ("B") REFERENCES "Work_"("id") ON DELETE CASCADE ON UPDATE CASCADE;
