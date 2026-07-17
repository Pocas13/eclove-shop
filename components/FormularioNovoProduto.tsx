"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Categoria = { id: string; nome: string };

export default function FormularioNovoProduto() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [aEnviarImagem, setAEnviarImagem] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
    const dados = {
      nome,
      slug: nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      descricao: form.get("descricao"),
      sku: form.get("sku"),
      categoriaId: form.get("categoriaId"),
      precoRetalho: parseFloat(form.get("precoRetalho") as string),
      precoProfissional: parseFloat(form.get("precoProfissional") as string),
      quantidadeMinimaB2B: parseInt((form.get("quantidadeMinimaB2B") as string) || "1", 10),
      stock: parseInt((form.get("stock") as string) || "0", 10),
      imagens: imagemUrl ? [imagemUrl] : [],
    };

    const resposta = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setAGuardar(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo.erro ?? "Não foi possível criar o produto.");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={submeter} className="space-y-4 max-w-lg">
      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <input name="nome" placeholder="Nome do produto" required className="w-full border border-linho-300 rounded-md p-3" />
      <textarea name="descricao" placeholder="Descrição" required rows={3} className="w-full border border-linho-300 rounded-md p-3" />
      <input name="sku" placeholder="SKU (código único)" required className="w-full border border-linho-300 rounded-md p-3" />

      <select name="categoriaId" required className="w-full border border-linho-300 rounded-md p-3">
        <option value="">Escolhe uma categoria</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <input name="precoRetalho" type="number" step="0.01" placeholder="Preço retalho (€)" required className="w-full border border-linho-300 rounded-md p-3" />
        <input name="precoProfissional" type="number" step="0.01" placeholder="Preço profissional (€)" required className="w-full border border-linho-300 rounded-md p-3" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input name="stock" type="number" placeholder="Stock" className="w-full border border-linho-300 rounded-md p-3" />
        <input name="quantidadeMinimaB2B" type="number" placeholder="Qtd. mínima B2B" className="w-full border border-linho-300 rounded-md p-3" />
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

      <button type="submit" disabled={aGuardar} className="w-full bg-garrafa-700 text-white py-3 rounded-md disabled:opacity-50">
        {aGuardar ? "A guardar..." : "Criar produto"}
      </button>
    </form>
  );
}
