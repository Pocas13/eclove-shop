"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Subcategoria = { id: string; nome: string };
type Categoria = { id: string; nome: string; subcategorias: Subcategoria[] };

type ProdutoExistente = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  sku: string;
  categoriaId: string;
  preco: number | string;
  stock: number;
  material: string | null;
  largura_cm: number | null;
  altura_cm: number | null;
  profundidade_cm: number | null;
  imagens: string[];
  ativo: boolean;
};

const MAX_IMAGENS = 8;

export default function FormularioProduto({ produtoExistente }: { produtoExistente?: ProdutoExistente }) {
  const router = useRouter();
  const emEdicao = !!produtoExistente;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagens, setImagens] = useState<string[]>(produtoExistente?.imagens ?? []);
  const [urlManual, setUrlManual] = useState("");
  const [aEnviarImagem, setAEnviarImagem] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ativo, setAtivo] = useState(produtoExistente?.ativo ?? true);
  const podeAdicionar = imagens.length < MAX_IMAGENS;

  useEffect(() => {
    fetch("/api/categorias").then((r) => r.json()).then(setCategorias).catch(() => setErro("Não foi possível carregar as categorias."));
  }, []);

  const resumoImagens = useMemo(() => `${imagens.length}/${MAX_IMAGENS} imagens`, [imagens.length]);

  async function enviarImagens(e: React.ChangeEvent<HTMLInputElement>) {
    const ficheiros = Array.from(e.target.files ?? []).slice(0, MAX_IMAGENS - imagens.length);
    if (ficheiros.length === 0) return;
    setErro(null);
    setAEnviarImagem(true);
    try {
      const novas: string[] = [];
      for (const ficheiro of ficheiros) {
        const formData = new FormData();
        formData.append("ficheiro", ficheiro);
        const resposta = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const corpo = await resposta.json();
        if (!resposta.ok) throw new Error(corpo.erro ?? `Falhou o envio de ${ficheiro.name}.`);
        novas.push(corpo.url);
      }
      setImagens((atuais) => [...atuais, ...novas].slice(0, MAX_IMAGENS));
      e.target.value = "";
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setAEnviarImagem(false);
    }
  }

  function adicionarUrl() {
    const url = urlManual.trim();
    if (!url || !podeAdicionar) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) {
      setErro("Introduza um URL completo ou um caminho iniciado por /. ");
      return;
    }
    setImagens((atuais) => [...atuais, url]);
    setUrlManual("");
    setErro(null);
  }

  function moverImagem(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= imagens.length) return;
    setImagens((atuais) => {
      const copia = [...atuais];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  }

  async function submeter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setAGuardar(true);
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") || "");
    const dadosComuns = {
      nome,
      descricao: String(form.get("descricao") || ""),
      sku: String(form.get("sku") || produtoExistente?.sku || ""),
      categoriaId: String(form.get("categoriaId") || ""),
      preco: Number.parseFloat(String(form.get("preco") || "0")),
      stock: Number.parseInt(String(form.get("stock") || "0"), 10),
      material: String(form.get("material") || "") || undefined,
      largura_cm: form.get("largura_cm") ? Number.parseInt(String(form.get("largura_cm")), 10) : undefined,
      altura_cm: form.get("altura_cm") ? Number.parseInt(String(form.get("altura_cm")), 10) : undefined,
      profundidade_cm: form.get("profundidade_cm") ? Number.parseInt(String(form.get("profundidade_cm")), 10) : undefined,
      imagens,
    };
    let resposta: Response;
    if (emEdicao) {
      resposta = await fetch(`/api/produtos/${produtoExistente!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...dadosComuns, slug: produtoExistente!.slug, ativo }) });
    } else {
      const slug = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      resposta = await fetch("/api/produtos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...dadosComuns, slug }) });
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
    if (!produtoExistente || !confirm("Desativar este produto? O histórico de encomendas mantém-se.")) return;
    setAGuardar(true);
    await fetch(`/api/produtos/${produtoExistente.id}`, { method: "DELETE" });
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={submeter} className="max-w-3xl space-y-6">
      {erro && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erro}</p>}
      <section className="space-y-4 rounded-3xl border border-calcario-200 p-5 sm:p-7">
        <div><h2 className="font-display text-2xl font-bold">Informação principal</h2><p className="mt-1 text-sm text-grafite-500">Use um nome claro e uma descrição completa, incluindo utilização, acabamento e cuidados.</p></div>
        <input name="nome" placeholder="Nome do produto" required defaultValue={produtoExistente?.nome} className="w-full rounded-xl border border-areia-300 p-3" />
        <textarea name="descricao" placeholder="Descrição detalhada do produto" required rows={7} defaultValue={produtoExistente?.descricao} className="w-full rounded-xl border border-areia-300 p-3" />
        <div className="grid gap-4 sm:grid-cols-2"><input name="sku" placeholder="SKU (código único)" required defaultValue={produtoExistente?.sku} disabled={emEdicao} className="w-full rounded-xl border border-areia-300 p-3 disabled:bg-areia-100" /><select name="categoriaId" required defaultValue={produtoExistente?.categoriaId} className="w-full rounded-xl border border-areia-300 p-3"><option value="">Escolha uma subcategoria</option>{categorias.map((cat) => <optgroup key={cat.id} label={cat.nome}>{cat.subcategorias.length === 0 ? <option value={cat.id}>{cat.nome}</option> : cat.subcategorias.map((sub) => <option key={sub.id} value={sub.id}>{sub.nome}</option>)}</optgroup>)}</select></div>
      </section>

      <section className="space-y-4 rounded-3xl border border-calcario-200 p-5 sm:p-7">
        <h2 className="font-display text-2xl font-bold">Preço, stock e características</h2>
        <div className="grid gap-4 sm:grid-cols-2"><input name="preco" type="number" min="0.01" step="0.01" placeholder="Preço (€)" required defaultValue={produtoExistente?.preco as any} className="w-full rounded-xl border border-areia-300 p-3" /><input name="stock" type="number" min="0" placeholder="Stock" defaultValue={produtoExistente?.stock} className="w-full rounded-xl border border-areia-300 p-3" /></div>
        <input name="material" placeholder="Material e acabamento (ex.: veludo e carvalho)" defaultValue={produtoExistente?.material ?? undefined} className="w-full rounded-xl border border-areia-300 p-3" />
        <div className="grid gap-4 sm:grid-cols-3"><input name="largura_cm" type="number" min="1" placeholder="Largura (cm)" defaultValue={produtoExistente?.largura_cm ?? undefined} className="w-full rounded-xl border border-areia-300 p-3" /><input name="altura_cm" type="number" min="1" placeholder="Altura (cm)" defaultValue={produtoExistente?.altura_cm ?? undefined} className="w-full rounded-xl border border-areia-300 p-3" /><input name="profundidade_cm" type="number" min="1" placeholder="Profundidade (cm)" defaultValue={produtoExistente?.profundidade_cm ?? undefined} className="w-full rounded-xl border border-areia-300 p-3" /></div>
      </section>

      <section className="space-y-5 rounded-3xl border border-calcario-200 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-bold">Fotografias</h2><p className="mt-1 text-sm text-grafite-500">A primeira fotografia é a capa. Recomendado: 1600 × 2000 px, JPG/WebP, fundo limpo e imagens de detalhe.</p></div><span className="rounded-full bg-calcario-100 px-3 py-1 text-xs font-bold">{resumoImagens}</span></div>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!podeAdicionar || aEnviarImagem} onChange={enviarImagens} />
        <div className="flex gap-2"><input value={urlManual} onChange={(e) => setUrlManual(e.target.value)} placeholder="Ou cole o URL de uma imagem" disabled={!podeAdicionar} className="min-w-0 flex-1 rounded-xl border border-areia-300 p-3" /><button type="button" onClick={adicionarUrl} disabled={!podeAdicionar} className="rounded-xl border border-grafite-900 px-4 text-sm font-bold disabled:opacity-50">Adicionar</button></div>
        {aEnviarImagem && <p className="text-sm text-grafite-500">A enviar fotografias…</p>}
        {imagens.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{imagens.map((imagem, indice) => <div key={`${imagem}-${indice}`} className="overflow-hidden rounded-2xl border border-calcario-200 bg-white"><img src={imagem} alt={`Fotografia ${indice + 1}`} className="aspect-[4/3] w-full object-cover" /><div className="flex items-center justify-between gap-2 p-3"><span className="text-xs font-bold">{indice === 0 ? "Capa" : `Imagem ${indice + 1}`}</span><div className="flex gap-1"><button type="button" onClick={() => moverImagem(indice, -1)} disabled={indice === 0} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-30">←</button><button type="button" onClick={() => moverImagem(indice, 1)} disabled={indice === imagens.length - 1} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-30">→</button><button type="button" onClick={() => setImagens((atuais) => atuais.filter((_, i) => i !== indice))} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600">Remover</button></div></div></div>)}</div>}
      </section>

      {emEdicao && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Produto ativo e visível no catálogo</label>}
      <div className="flex flex-wrap gap-3"><button type="submit" disabled={aGuardar || aEnviarImagem} className="btn-primary min-w-48 disabled:opacity-50">{aGuardar ? "A guardar…" : emEdicao ? "Guardar alterações" : "Criar produto"}</button>{emEdicao && <button type="button" onClick={desativar} disabled={aGuardar} className="rounded-full border border-red-600 px-6 py-3 text-sm font-bold text-red-600">Desativar</button>}</div>
    </form>
  );
}
