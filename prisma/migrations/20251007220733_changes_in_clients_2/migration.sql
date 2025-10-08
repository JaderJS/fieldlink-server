/*
  Warnings:

  - Made the column `city` on table `clients_more_infos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `clients_more_infos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."clients_more_infos_email_key";

-- DropIndex
DROP INDEX "public"."clients_more_infos_phone_key";

-- AlterTable
ALTER TABLE "public"."clients_more_infos" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL;
