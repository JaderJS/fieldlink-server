/*
  Warnings:

  - You are about to drop the `ServicesOnMaterials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServicesOnMaterials" DROP CONSTRAINT "ServicesOnMaterials_productId_fkey";

-- DropForeignKey
ALTER TABLE "ServicesOnMaterials" DROP CONSTRAINT "ServicesOnMaterials_serviceId_fkey";

-- DropTable
DROP TABLE "ServicesOnMaterials";

-- CreateTable
CREATE TABLE "ProductsOnWorks" (
    "workId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductsOnWorks_pkey" PRIMARY KEY ("workId","productId")
);

-- AddForeignKey
ALTER TABLE "ProductsOnWorks" ADD CONSTRAINT "ProductsOnWorks_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnWorks" ADD CONSTRAINT "ProductsOnWorks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
