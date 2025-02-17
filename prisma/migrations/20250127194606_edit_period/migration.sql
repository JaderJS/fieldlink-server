/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Period` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Period_name_key" ON "Period"("name");
