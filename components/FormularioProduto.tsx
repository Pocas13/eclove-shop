"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Subcategoria = { id: string; nome: string };
type Categoria = { id: string; nome: string; subcategorias: Subcategoria[] };

type ProdutoExistente = {
  id: string;
  nome: string;
  descricao: string;
  sku: string;
  categoriaId: string;
  precoRetalho: number | string;
  precoProfissional: number | string;
  quantidadeMinimaB2B: number;
  stock: number;
  material: string | null;
  largura_cm: number | null;
  altura_cm: number | null;
  profundidade_cm: number | null;
  imagens: string[];
  ativo: boolean;
};

export default function FormularioProduto({ produtoExistente }: { produtoExistente?: ProdutoExistente }) {
  const router = useRouter();
  const emEdicao = !!produtoExistente;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagemUrl, setImagemUrl] = useState<string | null>(produtoExistente?.imagens[0] ?? null);
  const [aEnviarImagem, setAEnviarImagem] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ativo, setAtivo] = useState(produtoExistente?.ativo ?? true);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then(setCategorias);
  }, []);

  async function enviarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiro = e.target.files?.[0];
    if (!ficheiro) return;

    setAEnviarImagem(true);
    const formData = new FormData();
    formData.append("ficheiro", ficheiro);

    const resposta = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const corpo = await resposta.json();
    setAEnviarImagem(false);

    if (resposta.ok) setImagemUrl(corpo.url);
  }

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAGuardar(true);

    const form = new FormData(e.currentTarget);
    const nome = form.get("nome") as string;

    const dadosComuns = {
      nome,
      descricao: form.get("descricao"),
      sku: form.get("sku"),
      categoriaId: form.get("categoriaId"),
      precoRetalho: parseFloat(form.get("precoRetalho") as string),
      precoProfissional: parseFloat(form.get("precoProfissional") as string),
      quantidadeMinimaB2B: parseInt((form.get("quantidadeMinimaB2B") as string) || "1", 10),
      stock: parseInt((form.get("stock") as string) || "0", 10),
      material: (form.get("material") as string) || undefined,
      largura_cm: form.get("largura_cm") ? parseInt(form.get("largura_cm") as string, 10) : undefined,
      altura_cm: form.get("altura_cm") ? parseInt(form.get("altura_cm") as string, 10) : undefined,
      profundidade_cm: form.get("profundidade_cm") ? parseInt(form.get("profundidade_cm") as string, 10) : undefined,
      imagens: imagemUrl ? [imagemUrl] : [],
    };

    let resposta: Response;

    if (emEdicao) {
      resposta = await fetch(`/api/produtos/${produtoExistente!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dadosComuns, ativo }),
      });
    } else {
      const slug = nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      resposta = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dadosComuns, slug }),
      });
    }

    setAGuardar(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo.erro ?? "Não foi possível guardar o produto.");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  async function desativar() {
    if (!produtoExistente) return;
    if (!confirm("Desativar este produto? Deixa de aparecer no catálogo, mas o histórico de encomendas mantém-se.")) return;

    setAGuardar(true);
    await fetch(`/api/produtos/${produtoExistente.id}`, { method: "DELETE" });
    setAGuardar(false);
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={submeter} className="space-y-4 max-w-lg">
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <input
        name="nome"
        placeholder="Nome do produto"
        required
        defaultValue={produtoExistente?.nome}
        className="w-full border border-linho-300 rounded-md p-3"
      />
      <textarea
        name="descricao"
        placeholder="Descrição"
        required
        rows={3}
        defaultValue={produtoExistente?.descricao}
        className="w-full border border-linho-300 rounded-md p-3"
      />
      <input
        name="sku"
        placeholder="SKU (código único)"
        required
        defaultValue={produtoExistente?.sku}
        disabled={emEdicao}
        className="w-full border border-linho-300 rounded-md p-3 disabled:bg-linho-100 disabled:text-tinta-500"
      />

      <select
        name="categoriaId"
        required
        defaultValue={produtoExistente?.categoriaId}
        className="w-full border border-linho-300 rounded-md p-3"
      >
        <option value="">Escolhe uma subcategoria</option>
        {categorias.map((cat) => (
          <optgroup key={cat.id} label={cat.nome}>
            {cat.subcategorias.length === 0 ? (
              <option value={cat.id}>{cat.nome}</option>
            ) : (
              cat.subcategorias.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))
            )}
          </optgroup>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="precoRetalho"
          type="number"
          step="0.01"
          placeholder="Preço retalho (€)"
          required
          defaultValue={produtoExistente?.precoRetalho as any}
          className="w-full border border-linho-300 rounded-md p-3"
        />
        <input
          name="precoProfissional"
          type="number"
          step="0.01"
          placeholder="Preço profissional (€)"
          required
          defaultValue={produtoExistente?.precoProfissional as any}
          className="w-full border border-linho-300 rounded-md p-3"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          defaultValue={produtoExistente?.stock}
          className="w-full border border-linho-300 rounded-md p-3"
        />
        <input
          name="quantidadeMinimaB2B"
          type="number"
          placeholder="Qtd. mínima B2B"
          defaultValue={produtoExistente?.quantidadeMinimaB2B}
          className="w-full border border-linho-300 rounded-md p-3"
        />
      </div>

      <input
        name="material"
        placeholder="Material (ex: Veludo / Carvalho)"
        defaultValue={produtoExistente?.material ?? undefined}
        className="w-full border border-linho-300 rounded-md p-3"
      />

      <div className="grid grid-cols-3 gap-4">
        <input name="largura_cm" type="number" placeholder="Largura (cm)" defaultValue={produtoExistente?.largura_cm ?? undefined} className="w-full border border-linho-300 rounded-md p-3" />
        <input name="altura_cm" type="number" placeholder="Altura (cm)" defaultValue={produtoExistente?.altura_cm ?? undefined} className="w-full border border-linho-300 rounded-md p-3" />
        <input name="profundidade_cm" type="number" placeholder="Profundidade (cm)" defaultValue={produtoExistente?.profundidade_cm ?? undefined} className="w-full border border-linho-300 rounded-md p-3" />
      </div>

      <div>
        <label className="block text-sm text-tinta-500 mb-1">Imagem principal</label>
        <input type="file" accept="image/*" onChange={enviarImagem} />
        {aEnviarImagem && <p className="text-sm text-tinta-500 mt-1">A enviar imagem...</p>}
        {imagemUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagemUrl} alt="Pré-visualização" className="mt-2 w-32 h-32 object-cover rounded-md" />
        )}
      </div>

      {emEdicao && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Produto ativo (visível no catálogo)
        </label>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={aGuardar} className="flex-1 bg-garrafa-700 text-white py-3 rounded-md hover:bg-garrafa-600 transition-colors disabled:opacity-50">
          {aGuardar ? "A guardar..." : emEdicao ? "Guardar alterações" : "Criar produto"}
        </button>
        {emEdicao && (
          <button
            type="button"
            onClick={desativar}
            disabled={aGuardar}
            className="border border-red-600 text-red-600 px-4 py-3 rounded-md disabled:opacity-50"
          >
            Desativar
          </button>
        )}
      </div>
    </form>
  );
}
