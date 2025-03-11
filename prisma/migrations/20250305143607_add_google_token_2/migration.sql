/*
  Warnings:

  - You are about to drop the `googleToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "googleToken" DROP CONSTRAINT "googleToken_userCuid_fkey";

-- DropTable
DROP TABLE "googleToken";

-- CreateTable
CREATE TABLE "GoogleTokens" (
    "id" SERIAL NOT NULL,
    "tokens" JSONB NOT NULL,

    CONSTRAINT "GoogleTokens_pkey" PRIMARY KEY ("id")
);
