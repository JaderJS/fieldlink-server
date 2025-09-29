-- AlterTable
ALTER TABLE "public"."Work" ADD COLUMN     "content" JSONB,
ALTER COLUMN "title" DROP DEFAULT;
