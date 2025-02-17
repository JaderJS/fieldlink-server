-- CreateEnum
CREATE TYPE "TypeProduct" AS ENUM ('UND', 'm', 'L', 'g');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "priceFn" TEXT,
ADD COLUMN     "unity" "TypeProduct" NOT NULL DEFAULT 'UND';
