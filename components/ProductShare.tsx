"use client";

const canais = [
  { nome: "Facebook", url: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { nome: "Pinterest", url: (u: string, t: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(u)}&description=${encodeURIComponent(t)}` },
  { nome: "WhatsApp", url: (u: string, t: string) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
];

export default function ProductShare({ titulo }: { titulo: string }) {
  function partilhar(canal: typeof canais[number]) {
    const url = window.location.href;
    window.open(canal.url(url, titulo), "_blank", "noopener,noreferrer,width=720,height=620");
  }
  return <div className="flex flex-wrap gap-2" aria-label="Partilhar produto">
    {canais.map((c) => <button key={c.nome} type="button" onClick={() => partilhar(c)} className="rounded-full border border-calcario-300 px-3 py-2 text-xs font-semibold hover:border-barro-500 hover:text-barro-600">{c.nome}</button>)}
  </div>;
}
