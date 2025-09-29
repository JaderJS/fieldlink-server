-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "otherValues" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "Work" ADD COLUMN     "otherValues" JSONB[] DEFAULT ARRAY[]::JSONB[];
