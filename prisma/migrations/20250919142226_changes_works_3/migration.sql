-- AlterTable
ALTER TABLE "public"."Work" ADD COLUMN     "archives" JSONB[] DEFAULT ARRAY[]::JSONB[];
