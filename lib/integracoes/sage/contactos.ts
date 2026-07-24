import { prisma } from "@/lib/prisma";
import { SageClient, sageItems } from "./client";

export async function garantirContactoSage(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { enderecos: { orderBy: { principal: "desc" }, take: 1 } } });
  if (user.sageContactId) return user.sageContactId;
  const client = new SageClient();
  const existentes = await client.request<any>("/contacts", { query: { email: user.email, items_per_page: "20" } });
  const encontrado = sageItems<any>(existentes).find((item) => String(item.email ?? "").toLowerCase() === user.email.toLowerCase());
  if (encontrado?.id) {
    await prisma.user.update({ where: { id: user.id }, data: { sageContactId: String(encontrado.id) } });
    return String(encontrado.id);
  }
  const endereco = user.enderecos[0];
  const resposta = await client.request<any>("/contacts", {
    method: "POST",
    body: {
      contact: {
        name: user.empresaNome || user.nome,
        contact_type_ids: [],
        reference: user.nif || user.id,
        main_address: endereco ? { address_line_1: endereco.linha1, address_line_2: endereco.linha2 || undefined, city: endereco.cidade, postal_code: endereco.codigoPostal, country: endereco.pais } : undefined,
        main_contact_person: { name: user.nome, email: user.email, telephone: user.telefone || undefined },
        tax_number: user.nif || undefined,
      },
    },
  });
  const id = String(resposta?.id ?? resposta?.$key ?? resposta?.contact?.id ?? "");
  if (!id) throw new Error("A Sage criou o contacto mas não devolveu um identificador reconhecível.");
  await prisma.user.update({ where: { id: user.id }, data: { sageContactId: id } });
  return id;
}
