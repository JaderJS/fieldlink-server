-- CreateEnum
CREATE TYPE "public"."OrderStatusFlag" AS ENUM ('FINISHED', 'BUDGET', 'NOTHING');

-- AlterTable
ALTER TABLE "public"."order_status" ADD COLUMN     "status" "public"."OrderStatusFlag" NOT NULL DEFAULT 'NOTHING';
