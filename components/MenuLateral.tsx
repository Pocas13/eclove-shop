"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  ["Coleção", "/produtos"],
  ["Novidades", "/novidades"],
  ["Ambientes", "/divisoes"],
  ["Catálogos", "/catalogos"],
  ["Projetos", "/conta/listas"],
  ["Apoio", "/entregas"],
] as const;

export default function MenuLateral() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [aberto]);

  function fecharAoRetirarRato(evento: React.MouseEvent<HTMLElement>) {
    // Em dispositivos com rato, fecha quando o ponteiro sai do painel.
    // Em ecrãs táteis, o evento não interfere com a utilização normal.
    if (evento.pointerType !== "touch") setAberto(false);
  }

  return (
    <>
      <button
        type="button"
        className={`menu-trigger ${aberto ? "is-open" : ""}`}
        onClick={() => setAberto(true)}
        aria-label="Abrir menu de navegação"
        aria-expanded={aberto}
        aria-controls="menu-lateral-eclove"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <strong>Menu</strong>
      </button>

      {aberto && (
        <button
          type="button"
          className="menu-backdrop"
          onClick={() => setAberto(false)}
          aria-label="Fechar menu ao clicar fora"
        />
      )}

      <aside
        id="menu-lateral-eclove"
        className={`menu-drawer ${aberto ? "is-open" : ""}`}
        aria-hidden={!aberto}
        onPointerLeave={fecharAoRetirarRato}
      >
        <div className="menu-drawer-top">
          <span className="menu-kicker">Explorar Eclove</span>
          <button type="button" className="menu-close" onClick={() => setAberto(false)}>
            <span>Fechar</span>
            <b aria-hidden="true">×</b>
          </button>
        </div>

        <nav aria-label="Navegação principal">
          {links.map(([nome, href], i) => (
            <Link key={href} href={href} onClick={() => setAberto(false)}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <span>{nome}</span>
              <b aria-hidden="true">↗</b>
            </Link>
          ))}
        </nav>

        <div className="menu-drawer-bottom">
          <p>Conta profissional validada</p>
          <span>
            Consulte preços de revenda, stock, prazos, catálogos, documentos e encomendas num só lugar.
          </span>
          <Link href="/registo" onClick={() => setAberto(false)}>
            Pedir acesso
          </Link>
        </div>
      </aside>
    </>
  );
}
