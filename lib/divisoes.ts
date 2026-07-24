export type DivisaoCatalogo = {
  nome: string;
  slug: string;
  frase: string;
  descricao: string;
  imagem: string;
  categorias: string[];
  subdivisoes: { nome: string; slug: string }[];
};

export const divisoesCatalogo: DivisaoCatalogo[] = [
  {
    nome: "Sala de estar",
    slug: "sala-de-estar",
    frase: "Conforto para todos os dias",
    descricao: "Sofás, mesas de centro, móveis de TV, poltronas e soluções para reunir a família.",
    imagem: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85",
    categorias: ["sofas", "sala", "decoracao", "iluminacao"],
    subdivisoes: [
      { nome: "Sofás", slug: "sofas" }, { nome: "Chaise longue", slug: "chaise-longue" },
      { nome: "Poltronas e cadeirões", slug: "cadeiras-lounge" }, { nome: "Mesas de centro", slug: "mesas-centro" },
      { nome: "Móveis de TV", slug: "moveis-tv" }, { nome: "Consolas", slug: "consolas" },
      { nome: "Estantes", slug: "estantes" }, { nome: "Tapetes", slug: "tapetes" },
    ],
  },
  {
    nome: "Sala de jantar",
    slug: "sala-de-jantar",
    frase: "Espaço para reunir",
    descricao: "Mesas, cadeiras, aparadores e iluminação para refeições do dia a dia e ocasiões especiais.",
    imagem: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1600&q=85",
    categorias: ["mesas", "cadeiras", "sala-de-jantar", "iluminacao"],
    subdivisoes: [
      { nome: "Mesas de jantar", slug: "mesas-jantar" }, { nome: "Mesas extensíveis", slug: "mesas-extensiveis" },
      { nome: "Cadeiras de jantar", slug: "cadeiras-jantar" }, { nome: "Bancos", slug: "bancos" },
      { nome: "Aparadores", slug: "aparadores" }, { nome: "Vitrines", slug: "vitrines" },
    ],
  },
  {
    nome: "Quarto",
    slug: "quarto",
    frase: "Descanso com personalidade",
    descricao: "Camas, colchões, mesas de cabeceira, cómodas e roupeiros para um quarto organizado e confortável.",
    imagem: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85",
    categorias: ["quarto", "arrumacao"],
    subdivisoes: [
      { nome: "Camas de casal", slug: "camas-casal" }, { nome: "Camas individuais", slug: "camas-individuais" },
      { nome: "Colchões", slug: "colchoes" }, { nome: "Mesas de cabeceira", slug: "mesas-cabeceira" },
      { nome: "Cómodas", slug: "comodas" }, { nome: "Roupeiros", slug: "roupeiros" },
      { nome: "Bancos de quarto", slug: "bancos-quarto" },
    ],
  },
  {
    nome: "Quarto infantil e juvenil",
    slug: "quarto-infantil-juvenil",
    frase: "Espaços para crescer",
    descricao: "Camas, secretárias, arrumação e acessórios adaptados às várias fases da infância e juventude.",
    imagem: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85",
    categorias: ["infantil", "quarto", "arrumacao"],
    subdivisoes: [
      { nome: "Camas infantis", slug: "camas-infantis" }, { nome: "Beliches", slug: "beliches" },
      { nome: "Secretárias juvenis", slug: "secretarias-juvenis" }, { nome: "Arrumação infantil", slug: "arrumacao-infantil" },
    ],
  },
  {
    nome: "Escritório",
    slug: "escritorio",
    frase: "Trabalhar com mais conforto",
    descricao: "Secretárias, cadeiras ergonómicas e arrumação funcional para casa ou empresa.",
    imagem: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
    categorias: ["escritorio", "cadeiras", "arrumacao"],
    subdivisoes: [
      { nome: "Secretárias", slug: "secretarias" }, { nome: "Cadeiras de escritório", slug: "cadeiras-escritorio" },
      { nome: "Estantes de escritório", slug: "estantes-escritorio" }, { nome: "Gaveteiros", slug: "gaveteiros" },
    ],
  },
  {
    nome: "Hall de entrada",
    slug: "hall-de-entrada",
    frase: "A primeira impressão da casa",
    descricao: "Consolas, sapateiras, bancos, cabides e espelhos para entradas bonitas e organizadas.",
    imagem: "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1600&q=85",
    categorias: ["hall", "arrumacao", "decoracao"],
    subdivisoes: [
      { nome: "Consolas", slug: "consolas" }, { nome: "Sapateiras", slug: "sapateiras" },
      { nome: "Bengaleiros", slug: "bengaleiros" }, { nome: "Espelhos", slug: "espelhos" },
    ],
  },
  {
    nome: "Casa de banho",
    slug: "casa-de-banho",
    frase: "Organização em pouco espaço",
    descricao: "Móveis auxiliares, armários, espelhos e arrumação para uma rotina mais simples.",
    imagem: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1600&q=85",
    categorias: ["casa-de-banho", "arrumacao"],
    subdivisoes: [
      { nome: "Móveis de casa de banho", slug: "moveis-casa-banho" }, { nome: "Armários auxiliares", slug: "armarios-casa-banho" },
      { nome: "Espelhos de casa de banho", slug: "espelhos-casa-banho" }, { nome: "Bancos e arrumação", slug: "arrumacao-casa-banho" },
    ],
  },
  {
    nome: "Cozinha",
    slug: "cozinha",
    frase: "Funcionalidade para todos os dias",
    descricao: "Mesas, bancos, carros auxiliares e arrumação para complementar a cozinha.",
    imagem: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=1600&q=85",
    categorias: ["cozinha", "mesas", "cadeiras", "arrumacao"],
    subdivisoes: [
      { nome: "Mesas de cozinha", slug: "mesas-cozinha" }, { nome: "Bancos altos", slug: "bancos-altos" },
      { nome: "Carros auxiliares", slug: "carros-cozinha" }, { nome: "Despenseiros", slug: "despenseiros" },
    ],
  },
  {
    nome: "Jardim e varanda",
    slug: "jardim-varanda",
    frase: "Viver mais o exterior",
    descricao: "Mesas, cadeiras, conjuntos lounge e arrumação para jardins, terraços e varandas.",
    imagem: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85",
    categorias: ["jardim", "exterior"],
    subdivisoes: [
      { nome: "Conjuntos de jardim", slug: "conjuntos-jardim" }, { nome: "Mesas de exterior", slug: "mesas-exterior" },
      { nome: "Cadeiras de exterior", slug: "cadeiras-exterior" }, { nome: "Sofás de exterior", slug: "sofas-exterior" },
      { nome: "Espreguiçadeiras", slug: "espreguicadeiras" }, { nome: "Arrumação exterior", slug: "arrumacao-exterior" },
    ],
  },
  {
    nome: "Arrumação",
    slug: "arrumacao",
    frase: "Um lugar para cada coisa",
    descricao: "Estantes, armários, prateleiras, sapateiras e soluções modulares para toda a casa.",
    imagem: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
    categorias: ["arrumacao"],
    subdivisoes: [
      { nome: "Estantes", slug: "estantes" }, { nome: "Armários", slug: "armarios" },
      { nome: "Prateleiras", slug: "prateleiras" }, { nome: "Sapateiras", slug: "sapateiras" },
      { nome: "Caixas e cestos", slug: "caixas-cestos" },
    ],
  },
  {
    nome: "Iluminação e decoração",
    slug: "iluminacao-decoracao",
    frase: "Os detalhes que transformam",
    descricao: "Candeeiros, tapetes, espelhos e acessórios para completar cada ambiente.",
    imagem: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=85",
    categorias: ["iluminacao", "decoracao"],
    subdivisoes: [
      { nome: "Candeeiros de teto", slug: "candeeiros-teto" }, { nome: "Candeeiros de pé", slug: "candeeiros-pe" },
      { nome: "Candeeiros de mesa", slug: "candeeiros-mesa" }, { nome: "Tapetes", slug: "tapetes" },
      { nome: "Espelhos", slug: "espelhos" }, { nome: "Almofadas e têxteis", slug: "texteis" },
    ],
  },
];

export function obterDivisao(slug: string) {
  return divisoesCatalogo.find((divisao) => divisao.slug === slug);
}
