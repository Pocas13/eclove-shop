import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Admin de exemplo — muda a password depois!
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@eclove.pt" },
    update: {},
    create: {
      nome: "Administrador Eclove",
      email: "admin@eclove.pt",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Categorias reais da Eclove
  const categorias = await Promise.all(
    [
      { nome: "Cadeiras", slug: "cadeiras" },
      { nome: "Cadeiras Lounge", slug: "cadeiras-lounge" },
      { nome: "Coffee Tables, Consolas e Móveis TV", slug: "coffeetables-consolas-moveistv" },
      { nome: "Mesas de Jantar", slug: "mesas-jantar" },
      { nome: "Sofás", slug: "sofas" },
    ].map((c) => prisma.categoria.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );

  const [, cadeirasLounge, , mesasJantar, sofas] = categorias;

  await prisma.produto.upsert({
    where: { sku: "SOF-001" },
    update: {},
    create: {
      nome: "Sofá Esmoriz 3 Lugares",
      slug: "sofa-esmoriz-3-lugares",
      descricao: "Sofá de 3 lugares em tecido bouclé, estrutura em madeira maciça de pinho.",
      sku: "SOF-001",
      categoriaId: sofas.id,
      precoRetalho: 899.0,
      precoProfissional: 620.0,
      quantidadeMinimaB2B: 2,
      stock: 15,
      material: "Bouclé / Pinho maciço",
      largura_cm: 210,
      altura_cm: 85,
      profundidade_cm: 95,
      imagens: ["/placeholders/sofa.svg"],
    },
  });

  await prisma.produto.upsert({
    where: { sku: "CAD-001" },
    update: {},
    create: {
      nome: "Cadeira Lounge Requinte",
      slug: "cadeira-lounge-requinte",
      descricao: "Cadeira lounge com estrutura em carvalho e estofo em veludo, ideal para salas de estar sofisticadas.",
      sku: "CAD-001",
      categoriaId: cadeirasLounge.id,
      precoRetalho: 549.0,
      precoProfissional: 370.0,
      quantidadeMinimaB2B: 3,
      stock: 20,
      material: "Veludo / Carvalho",
      largura_cm: 75,
      altura_cm: 90,
      profundidade_cm: 80,
      imagens: ["/placeholders/cadeira-lounge.svg"],
    },
  });

  await prisma.produto.upsert({
    where: { sku: "MJT-001" },
    update: {},
    create: {
      nome: "Mesa de Jantar Atelier",
      slug: "mesa-jantar-atelier",
      descricao: "Mesa de jantar para 6 lugares, tampo em nogueira e pernas em latão escovado.",
      sku: "MJT-001",
      categoriaId: mesasJantar.id,
      precoRetalho: 1290.0,
      precoProfissional: 890.0,
      quantidadeMinimaB2B: 1,
      stock: 8,
      material: "Nogueira / Latão escovado",
      largura_cm: 200,
      altura_cm: 76,
      profundidade_cm: 100,
      imagens: ["/placeholders/mesa-jantar.svg"],
    },
  });

  console.log("Seed concluído. Login admin: admin@eclove.pt / admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
