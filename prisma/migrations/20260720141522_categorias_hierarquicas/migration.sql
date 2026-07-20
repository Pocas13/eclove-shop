/*
  Warnings:

  - A unique constraint covering the columns `[nome,parentId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Categoria_nome_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_parentId_key" ON "Categoria"("nome", "parentId");

-- AddForeignKey
ALTER TABLE "Categoria" ADD CONSTRAINT "Categoria_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
