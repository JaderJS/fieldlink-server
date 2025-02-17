-- DropForeignKey
ALTER TABLE "ProductsOnWorks" DROP CONSTRAINT "ProductsOnWorks_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductsOnWorks" DROP CONSTRAINT "ProductsOnWorks_workId_fkey";

-- AddForeignKey
ALTER TABLE "ProductsOnWorks" ADD CONSTRAINT "ProductsOnWorks_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductsOnWorks" ADD CONSTRAINT "ProductsOnWorks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
