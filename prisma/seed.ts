import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cria (ou reutiliza) uma categoria de topo e as suas subcategorias
async function criarCategoria(nome: string, slug: string, subnomes: { nome: string; slug: string }[] = []) {
  const pai = await prisma.categoria.upsert({
    where: { slug },
    update: {},
    create: { nome, slug },
  });

  const subs = await Promise.all(
    subnomes.map((s) =>
      prisma.categoria.upsert({
        where: { slug: s.slug },
        update: {},
        create: { nome: s.nome, slug: s.slug, parentId: pai.id },
      })
    )
  );

  return { pai, subs };
}

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

  // Árvore de categorias/subcategorias — a rever e ajustar como quiseres
  const sofas = await criarCategoria("Sofás", "sofas", [
    { nome: "Sofás 2 Lugares", slug: "sofas-2-lugares" },
    { nome: "Sofás 3 Lugares", slug: "sofas-3-lugares" },
    { nome: "Cantos / Chaise Longue", slug: "cantos-chaise-longue" },
  ]);

  const cadeiras = await criarCategoria("Cadeiras", "cadeiras", [
    { nome: "Cadeiras de Jantar", slug: "cadeiras-jantar" },
    { nome: "Cadeiras Lounge", slug: "cadeiras-lounge" },
    { nome: "Cadeiras de Escritório", slug: "cadeiras-escritorio" },
  ]);

  const mesas = await criarCategoria("Mesas", "mesas", [
    { nome: "Mesas de Jantar", slug: "mesas-jantar" },
    { nome: "Mesas de Centro", slug: "mesas-centro" },
    { nome: "Mesas de Apoio", slug: "mesas-apoio" },
  ]);

  const camas = await criarCategoria("Camas", "camas", [
    { nome: "Cama de Casal", slug: "cama-casal" },
    { nome: "Cama de Solteiro", slug: "cama-solteiro" },
    { nome: "Camas Articuladas", slug: "camas-articuladas" },
  ]);

  await criarCategoria("Arrumação", "arrumacao", [
    { nome: "Roupeiros", slug: "roupeiros" },
    { nome: "Cómodas", slug: "comodas" },
    { nome: "Estantes e Bibliotecas", slug: "estantes-bibliotecas" },
  ]);

  await criarCategoria("Consolas e Móveis de TV", "consolas-moveis-tv", [
    { nome: "Consolas", slug: "consolas" },
    { nome: "Móveis de TV", slug: "moveis-tv" },
  ]);

  await criarCategoria("Iluminação", "iluminacao", [
    { nome: "Candeeiros de Pé", slug: "candeeiros-pe" },
    { nome: "Candeeiros de Mesa", slug: "candeeiros-mesa" },
    { nome: "Suspensões", slug: "suspensoes" },
  ]);

  await criarCategoria("Decoração", "decoracao", [
    { nome: "Espelhos", slug: "espelhos" },
    { nome: "Tapetes", slug: "tapetes" },
    { nome: "Têxteis", slug: "texteis" },
  ]);

  // Produtos de exemplo, associados a subcategorias
  await prisma.produto.upsert({
    where: { sku: "SOF-001" },
    update: {},
    create: {
      nome: "Sofá Esmoriz 3 Lugares",
      slug: "sofa-esmoriz-3-lugares",
      descricao: "Sofá de 3 lugares em tecido bouclé, estrutura em madeira maciça de pinho.",
      sku: "SOF-001",
      categoriaId: sofas.subs[1].id, // Sofás 3 Lugares
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
      categoriaId: cadeiras.subs[1].id, // Cadeiras Lounge
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
      categoriaId: mesas.subs[0].id, // Mesas de Jantar
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

  await prisma.produto.upsert({
    where: { sku: "CAM-001" },
    update: {},
    create: {
      nome: "Cama Requinte Casal",
      slug: "cama-requinte-casal",
      descricao: "Cama de casal com cabeceira estofada em veludo, estrutura em madeira maciça.",
      sku: "CAM-001",
      categoriaId: camas.subs[0].id, // Cama de Casal
      precoRetalho: 780.0,
      precoProfissional: 540.0,
      quantidadeMinimaB2B: 2,
      stock: 10,
      material: "Veludo / Madeira maciça",
      largura_cm: 160,
      altura_cm: 120,
      profundidade_cm: 210,
      imagens: [],
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
