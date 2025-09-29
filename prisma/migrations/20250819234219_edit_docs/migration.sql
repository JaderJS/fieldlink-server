/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Doc` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdCuid` to the `Doc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Doc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Doc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedCuid` to the `Doc` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `Doc` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEW');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('PAGE', 'DATABASE', 'TEMPLATE', 'BOARD', 'CALENDAR', 'GALLERY');

-- CreateEnum
CREATE TYPE "DocVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'WORKSPACE', 'SHARED');

-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "category" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "createdCuid" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentCuid" TEXT,
ADD COLUMN     "properties" JSONB,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "DocStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "templateCuid" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedCuid" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "visibility" "DocVisibility" NOT NULL DEFAULT 'PRIVATE',
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Doc_slug_key" ON "Doc"("slug");

-- CreateIndex
CREATE INDEX "Doc_parentCuid_idx" ON "Doc"("parentCuid");

-- CreateIndex
CREATE INDEX "Doc_createdCuid_idx" ON "Doc"("createdCuid");

-- CreateIndex
CREATE INDEX "Doc_updatedCuid_idx" ON "Doc"("updatedCuid");

-- CreateIndex
CREATE INDEX "Doc_isDeleted_idx" ON "Doc"("isDeleted");

-- CreateIndex
CREATE INDEX "Doc_isFavorite_idx" ON "Doc"("isFavorite");

-- CreateIndex
CREATE INDEX "Doc_status_idx" ON "Doc"("status");

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_parentCuid_fkey" FOREIGN KEY ("parentCuid") REFERENCES "Doc"("cuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_templateCuid_fkey" FOREIGN KEY ("templateCuid") REFERENCES "Doc"("cuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_updatedCuid_fkey" FOREIGN KEY ("updatedCuid") REFERENCES "User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_createdCuid_fkey" FOREIGN KEY ("createdCuid") REFERENCES "User"("cuid") ON DELETE CASCADE ON UPDATE CASCADE;
