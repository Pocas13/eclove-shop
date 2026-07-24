import Link from "next/link";

const links = [
  ["Visão geral", "/admin/dashboard"],
  ["Encomendas", "/admin/encomendas"],
  ["Produtos e stock", "/admin/produtos"],
  ["Clientes", "/admin/clientes"],
  ["Validações", "/admin/profissionais"],
  ["Sage", "/admin/integracoes/sage"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <section className="admin-shell"><div className="admin-wrap">
    <aside className="admin-sidebar">
      <div className="px-4 pb-4 pt-2"><p className="eyebrow">Gestão</p><p className="mt-1 font-display text-xl font-bold">Eclove</p></div>
      <nav className="grid gap-1">{links.map(([label, href]) => <Link key={href} href={href} className="admin-link"><span>{label}</span><span aria-hidden>→</span></Link>)}</nav>
      <div className="mt-4 rounded-2xl bg-grafite-900 p-4 text-white"><p className="text-xs font-bold uppercase tracking-wider text-white/50">Ambiente</p><p className="mt-1 text-sm font-semibold">Demonstração ativa</p><p className="mt-2 text-xs leading-5 text-white/60">Produtos, clientes e encomendas fictícios para testar todos os fluxos.</p></div>
    </aside>
    <div className="admin-main">{children}</div>
  </div></section>;
}
