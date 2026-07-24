import { prisma } from "@/lib/prisma";
import FormularioProduto from "@/components/FormularioProduto";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl text-tinta-900 mb-6">Editar Produto</h1>
      <FormularioProduto
        produtoExistente={{
          id: produto.id,
          nome: produto.nome,
          slug: produto.slug,
          descricao: produto.descricao,
          sku: produto.sku,
          categoriaId: produto.categoriaId,
          preco: Number(produto.preco),
          stock: produto.stock,
          material: produto.material,
          largura_cm: produto.largura_cm,
          altura_cm: produto.altura_cm,
          profundidade_cm: produto.profundidade_cm,
          imagens: produto.imagens,
          ativo: produto.ativo,
        }}
      />
    </div>
  );
}
