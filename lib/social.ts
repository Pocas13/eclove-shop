export const social = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  pinterest: process.env.NEXT_PUBLIC_PINTEREST_URL || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002",
};
export function metadataProduto(nome: string, descricao: string, imagem?: string) { return { title: nome, description: descricao, openGraph: { title: nome, description: descricao, images: imagem ? [{ url: imagem }] : [] } }; }
