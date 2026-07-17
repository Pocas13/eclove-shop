-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'PROFISSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProfissionalEstado" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "EncomendaEstado" AS ENUM ('PENDENTE', 'PAGA', 'EM_PREPARACAO', 'ENVIADA', 'ENTREGUE', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('B2C', 'B2B');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "telefone" TEXT,
    "nif" TEXT,
    "empresaNome" TEXT,
    "moradaFiscal" TEXT,
    "profissionalEstado" "ProfissionalEstado",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endereco" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "linha1" TEXT NOT NULL,
    "linha2" TEXT,
    "cidade" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Portugal',
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "precoRetalho" DECIMAL(10,2) NOT NULL,
    "precoProfissional" DECIMAL(10,2) NOT NULL,
    "quantidadeMinimaB2B" INTEGER NOT NULL DEFAULT 1,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "material" TEXT,
    "largura_cm" INTEGER,
    "altura_cm" INTEGER,
    "profundidade_cm" INTEGER,
    "imagens" TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarrinhoItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "CarrinhoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encomenda" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipoCliente" "TipoCliente" NOT NULL,
    "estado" "EncomendaEstado" NOT NULL DEFAULT 'PENDENTE',
    "total" DECIMAL(10,2) NOT NULL,
    "moradaEntrega" TEXT NOT NULL,
    "nifFatura" TEXT,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncomendaItem" (
    "id" TEXT NOT NULL,
    "encomendaId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "EncomendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_slug_key" ON "Produto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CarrinhoItem_userId_produtoId_key" ON "CarrinhoItem"("userId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Encomenda_numero_key" ON "Encomenda"("numero");

-- AddForeignKey
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhoItem" ADD CONSTRAINT "CarrinhoItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarrinhoItem" ADD CONSTRAINT "CarrinhoItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncomendaItem" ADD CONSTRAINT "EncomendaItem_encomendaId_fkey" FOREIGN KEY ("encomendaId") REFERENCES "Encomenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EncomendaItem" ADD CONSTRAINT "EncomendaItem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
