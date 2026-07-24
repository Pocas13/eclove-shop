import { Resend } from "resend";

const EMAIL_GERAL = process.env.EMAIL_ADMIN?.trim() || "geral@eclove.pt";
const REMETENTE = process.env.EMAIL_FROM?.trim() || "Eclove <geral@eclove.pt>";
const RESPOSTA_PARA = process.env.EMAIL_REPLY_TO?.trim() || EMAIL_GERAL;

function escapeHtml(valor: unknown): string {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function moldura(titulo: string, conteudo: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#171717;line-height:1.6">
      <div style="padding:22px 26px;background:#16211c;color:#fff">
        <strong style="font-size:20px;letter-spacing:.08em">ECLOVE</strong>
      </div>
      <div style="padding:26px;border:1px solid #e5e7eb;border-top:0">
        <h1 style="font-size:22px;margin:0 0 18px">${escapeHtml(titulo)}</h1>
        ${conteudo}
        <p style="margin:28px 0 0;color:#666;font-size:13px">Eclove · geral@eclove.pt</p>
      </div>
    </div>`;
}

/**
 * Envio de emails transacionais.
 * Em desenvolvimento, quando RESEND_API_KEY não está configurada, o envio é
 * ignorado sem impedir o arranque ou a compilação da aplicação.
 */
async function enviar(destinatario: string | string[], assunto: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const destinos = Array.isArray(destinatario) ? destinatario : [destinatario];

  if (!apiKey) {
    console.info(
      `[email não enviado — falta RESEND_API_KEY] para ${destinos.join(", ")}: ${assunto}`,
    );
    return { enviado: false as const, motivo: "RESEND_API_KEY em falta" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: REMETENTE,
    to: destinos,
    reply_to: RESPOSTA_PARA,
    subject: assunto,
    html,
  });

  if (error) {
    console.error("Falha ao enviar email Eclove", { destinos, assunto, error });
    return { enviado: false as const, motivo: error.message };
  }

  return { enviado: true as const, data };
}

export type DadosNovoRegisto = {
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  nif: string;
  morada: string;
};

export async function emailNovoRegistoProfissional(dados: DadosNovoRegisto) {
  const linhas = [
    ["Empresa", dados.empresa],
    ["Responsável", dados.nome],
    ["NIF", dados.nif],
    ["Email", dados.email],
    ["Telefone", dados.telefone],
    ["Morada", dados.morada],
  ].map(([rotulo, valor]) => `<tr><td style="padding:7px 12px 7px 0;color:#666">${escapeHtml(rotulo)}</td><td style="padding:7px 0"><strong>${escapeHtml(valor)}</strong></td></tr>`).join("");

  return enviar(
    EMAIL_GERAL,
    `Novo pedido de acesso — ${dados.empresa}`,
    moldura(
      "Novo pedido de acesso profissional",
      `<p>Foi criado um novo pedido de acesso e está a aguardar validação no backoffice.</p><table style="border-collapse:collapse;margin-top:16px">${linhas}</table>`,
    ),
  );
}

export async function emailPedidoRegistoRecebido(email: string, nome: string) {
  return enviar(
    email,
    "Recebemos o seu pedido de acesso",
    moldura(
      "Pedido recebido",
      `<p>Olá ${escapeHtml(nome)},</p><p>Recebemos o seu pedido de acesso à plataforma profissional Eclove. A conta permanece bloqueada até validação pela nossa equipa.</p><p>Receberá uma nova mensagem quando o pedido for analisado.</p>`,
    ),
  );
}

export async function emailConfirmacaoEncomenda(
  email: string,
  numeroEncomenda: string,
) {
  return enviar(
    email,
    `Encomenda ${numeroEncomenda} confirmada`,
    moldura(
      "Pagamento confirmado",
      `<p>Recebemos o pagamento da encomenda <strong>${escapeHtml(numeroEncomenda)}</strong>.</p><p>A encomenda vai entrar em preparação e receberá novas atualizações por email.</p>`,
    ),
  );
}

export async function emailNovaEncomenda(dados: {
  numero: string;
  clienteNome: string;
  clienteEmail: string;
  total: number | string;
}) {
  const valorTotal = Number(dados.total);
  const total = Number.isFinite(valorTotal)
    ? valorTotal.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
    : String(dados.total);

  return enviar(
    EMAIL_GERAL,
    `Nova encomenda paga — ${dados.numero}`,
    moldura(
      "Nova encomenda paga",
      `<p>Foi confirmado o pagamento de uma nova encomenda.</p>
       <table style="border-collapse:collapse;margin-top:16px">
         <tr><td style="padding:7px 12px 7px 0;color:#666">Encomenda</td><td><strong>${escapeHtml(dados.numero)}</strong></td></tr>
         <tr><td style="padding:7px 12px 7px 0;color:#666">Cliente</td><td><strong>${escapeHtml(dados.clienteNome)}</strong></td></tr>
         <tr><td style="padding:7px 12px 7px 0;color:#666">Email</td><td>${escapeHtml(dados.clienteEmail)}</td></tr>
         <tr><td style="padding:7px 12px 7px 0;color:#666">Total</td><td><strong>${escapeHtml(total)}</strong></td></tr>
       </table>`,
    ),
  );
}

export async function emailMudancaEstadoEncomenda(
  email: string,
  numeroEncomenda: string,
  estado: string,
) {
  return enviar(
    email,
    `Encomenda ${numeroEncomenda}: atualização`,
    moldura(
      "Atualização da encomenda",
      `<p>O estado da encomenda <strong>${escapeHtml(numeroEncomenda)}</strong> mudou para <strong>${escapeHtml(estado)}</strong>.</p>`,
    ),
  );
}

export async function emailDecisaoProfissional(email: string, aprovado: boolean) {
  return enviar(
    email,
    aprovado ? "Conta profissional aprovada" : "Atualização do pedido de acesso",
    moldura(
      aprovado ? "Conta aprovada" : "Pedido não aprovado",
      aprovado
        ? "<p>A sua conta profissional Eclove foi aprovada. Já pode iniciar sessão e consultar preços, stock, prazos e documentação.</p>"
        : "<p>O seu pedido de acesso não foi aprovado. Para esclarecimentos, responda a esta mensagem ou contacte geral@eclove.pt.</p>",
    ),
  );
}
