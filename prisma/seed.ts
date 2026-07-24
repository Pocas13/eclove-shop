import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const d = (value: number) => new Prisma.Decimal(value);
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

async function categoria(nome: string, slug: string, parentId?: string) {
  return prisma.categoria.upsert({ where: { slug }, update: { nome, parentId }, create: { nome, slug, parentId } });
}

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@eclove.pt" },
    update: { nome: "Administrador Eclove", role: "ADMIN" },
    create: { nome: "Administrador Eclove", email: "admin@eclove.pt", passwordHash, role: "ADMIN", telefone: "220 000 000" },
  });

  const roots: Record<string, string> = {};
  for (const [nome, slug] of [["Sofás","sofas"],["Cadeiras","cadeiras"],["Mesas","mesas"],["Quarto","quarto"],["Arrumação","arrumacao"],["Sala","sala"],["Sala de jantar","sala-de-jantar"],["Iluminação","iluminacao"],["Decoração","decoracao"],["Infantil e juvenil","infantil"],["Escritório","escritorio"],["Hall de entrada","hall"],["Casa de banho","casa-de-banho"],["Cozinha","cozinha"],["Jardim","jardim"],["Exterior","exterior"]]) {
    roots[slug] = (await categoria(nome, slug)).id;
  }
  const cats: Record<string,string> = {};
  const subs = [
    ["Sofás 3 Lugares","sofas-3-lugares","sofas"],["Chaise Longue","chaise-longue","sofas"],["Cadeiras de Jantar","cadeiras-jantar","cadeiras"],["Cadeiras Lounge","cadeiras-lounge","cadeiras"],["Cadeiras de Escritório","cadeiras-escritorio","cadeiras"],["Mesas de Jantar","mesas-jantar","mesas"],["Mesas de Centro","mesas-centro","mesas"],["Camas de Casal","camas-casal","quarto"],["Roupeiros","roupeiros","arrumacao"],["Cómodas","comodas","arrumacao"],["Móveis de TV","moveis-tv","sala"],["Consolas","consolas","sala"],["Candeeiros","candeeiros","iluminacao"],["Candeeiros de teto","candeeiros-teto","iluminacao"],["Candeeiros de pé","candeeiros-pe","iluminacao"],["Candeeiros de mesa","candeeiros-mesa","iluminacao"],["Tapetes","tapetes","decoracao"],["Espelhos","espelhos","decoracao"],["Almofadas e têxteis","texteis","decoracao"],["Estantes","estantes","arrumacao"],["Armários","armarios","arrumacao"],["Prateleiras","prateleiras","arrumacao"],["Sapateiras","sapateiras","arrumacao"],["Caixas e cestos","caixas-cestos","arrumacao"],["Mesas extensíveis","mesas-extensiveis","sala-de-jantar"],["Bancos","bancos","sala-de-jantar"],["Aparadores","aparadores","sala-de-jantar"],["Vitrines","vitrines","sala-de-jantar"],["Camas individuais","camas-individuais","quarto"],["Colchões","colchoes","quarto"],["Mesas de cabeceira","mesas-cabeceira","quarto"],["Bancos de quarto","bancos-quarto","quarto"],["Camas infantis","camas-infantis","infantil"],["Beliches","beliches","infantil"],["Secretárias juvenis","secretarias-juvenis","infantil"],["Arrumação infantil","arrumacao-infantil","infantil"],["Secretárias","secretarias","escritorio"],["Estantes de escritório","estantes-escritorio","escritorio"],["Gaveteiros","gaveteiros","escritorio"],["Bengaleiros","bengaleiros","hall"],["Móveis de casa de banho","moveis-casa-banho","casa-de-banho"],["Armários de casa de banho","armarios-casa-banho","casa-de-banho"],["Espelhos de casa de banho","espelhos-casa-banho","casa-de-banho"],["Arrumação de casa de banho","arrumacao-casa-banho","casa-de-banho"],["Mesas de cozinha","mesas-cozinha","cozinha"],["Bancos altos","bancos-altos","cozinha"],["Carros auxiliares","carros-cozinha","cozinha"],["Despenseiros","despenseiros","cozinha"],["Conjuntos de jardim","conjuntos-jardim","jardim"],["Mesas de exterior","mesas-exterior","exterior"],["Cadeiras de exterior","cadeiras-exterior","exterior"],["Sofás de exterior","sofas-exterior","exterior"],["Espreguiçadeiras","espreguicadeiras","exterior"],["Arrumação exterior","arrumacao-exterior","exterior"]
  ];
  for (const [nome,slug,parent] of subs) cats[slug]=(await categoria(nome,slug,roots[parent])).id;

  const produtos = [
    ["SOF-001","Sofá Maré 3 Lugares","sofa-mare-3-lugares","sofas-3-lugares",749,15,"Bouclé / pinho",210,85,95,"sofa-mare"],
    ["SOF-002","Sofá Douro 3 Lugares","sofa-douro-3-lugares","sofas-3-lugares",899,7,"Tecido chenille",228,88,98,"sofa-douro"],
    ["SOF-003","Chaise Longue Atlântico","chaise-longue-atlantico","chaise-longue",1290,4,"Tecido antimanchas",285,86,165,"chaise-atlantico"],
    ["CAD-001","Cadeira Lounge Brisa","cadeira-lounge-brisa","cadeiras-lounge",459,20,"Veludo / carvalho",75,90,80,"cadeira-brisa"],
    ["CAD-002","Cadeira de Jantar Lima","cadeira-jantar-lima","cadeiras-jantar",129,32,"Tecido / faia",48,84,54,"cadeira-lima"],
    ["CAD-003","Cadeira Office Ergon","cadeira-office-ergon","cadeiras-escritorio",239,11,"Malha respirável",66,118,65,"cadeira-office"],
    ["MJT-001","Mesa de Jantar Costa","mesa-jantar-costa","mesas-jantar",990,8,"Nogueira",200,76,100,"mesa-costa"],
    ["MJT-002","Mesa Extensível Ria","mesa-extensivel-ria","mesas-jantar",679,6,"Carvalho",180,76,90,"mesa-ria"],
    ["MCT-001","Mesa de Centro Areal","mesa-centro-areal","mesas-centro",289,13,"Carvalho / metal",110,42,60,"mesa-centro"],
    ["CAM-001","Cama Brisa Casal","cama-brisa-casal","camas-casal",590,10,"Tecido / madeira",160,120,210,"cama-brisa"],
    ["ROP-001","Roupeiro Norte 4 Portas","roupeiro-norte-4-portas","roupeiros",849,3,"Melamina / espelho",240,220,60,"roupeiro-norte"],
    ["COM-001","Cómoda Luz 6 Gavetas","comoda-luz-6-gavetas","comodas",399,9,"Carvalho claro",140,82,45,"comoda-luz"],
    ["MTV-001","Móvel TV Mar","movel-tv-mar","moveis-tv",349,12,"Nogueira / metal",180,52,42,"movel-tv-mar"],
    ["CON-001","Consola Porto","consola-porto","consolas",329,5,"Freixo",120,82,35,"consola-porto"],
    ["CAN-001","Candeeiro de Pé Sol","candeeiro-pe-sol","candeeiros",159,18,"Metal / linho",45,165,45,"candeeiro-sol"],
    ["TAP-001","Tapete Areia 160x230","tapete-areia-160x230","tapetes",189,14,"Polipropileno",160,2,230,"tapete-areia"],
  ] as const;

  const productMap: Record<string, {id:string; preco: Prisma.Decimal}> = {};
  for (const [sku,nome,slug,cat,preco,stock,material,l,a,p,img] of produtos) {
    const prod = await prisma.produto.upsert({
      where: { sku },
      update: { nome, slug, categoriaId: cats[cat], preco: d(preco), stock, material, largura_cm:l, altura_cm:a, profundidade_cm:p, imagens:[`/demo/${img}.svg`], ativo:true },
      create: { nome, slug, descricao:`${nome}, selecionado para criar ambientes atuais, confortáveis e funcionais. Produto de demonstração.`, sku, categoriaId:cats[cat], preco:d(preco), stock, material, largura_cm:l, altura_cm:a, profundidade_cm:p, imagens:[`/demo/${img}.svg`], ativo:true, pesoKg: Math.max(5, Math.round(l*p/500)) },
    });
    productMap[sku]={id:prod.id,preco:prod.preco};
    await prisma.stock.upsert({ where:{produtoId_localizacao:{produtoId:prod.id,localizacao:"Armazém principal"}}, update:{quantidade:stock}, create:{produtoId:prod.id,quantidade:stock,localizacao:"Armazém principal"} });
    await prisma.alertaStock.upsert({ where:{produtoId:prod.id}, update:{minimo:5}, create:{produtoId:prod.id,minimo:5} });
  }

  const clientes = [
    ["ana.silva@demo.pt","Ana Silva",null,"912 345 678","245678901","Rua do Pinhal, 18","Vila Nova de Gaia","4430-210"],
    ["joao.martins@demo.pt","João Martins",null,"934 222 111","198765432","Avenida da República, 405","Matosinhos","4450-242"],
    ["marta.costa@demo.pt","Marta Costa",null,"966 410 320","276543219","Rua das Flores, 72","Porto","4050-265"],
    ["decor.norte@demo.pt","Rita Almeida","Decor Norte, Lda.","220 432 100","517654321","Rua Industrial, 120","Maia","4470-605"],
    ["hotel.ria@demo.pt","Paulo Rocha","Hotel Ria Azul, Lda.","234 880 120","509876543","Avenida Marginal, 9","Aveiro","3800-180"],
    ["miguel.sousa@demo.pt","Miguel Sousa",null,"918 500 440","223344556","Rua da Praia, 31","Espinho","4500-258"],
  ] as const;
  const users: Record<string,string>={};
  for (const [email,nome,empresa,telefone,nif,linha1,cidade,cp] of clientes) {
    const u=await prisma.user.upsert({where:{email},update:{nome,empresaNome:empresa,telefone,nif},create:{email,nome,empresaNome:empresa,telefone,nif,passwordHash:await bcrypt.hash("cliente123",10)}});
    users[email]=u.id;
    const existing=await prisma.endereco.findFirst({where:{userId:u.id,principal:true}});
    if(existing) await prisma.endereco.update({where:{id:existing.id},data:{linha1,cidade,codigoPostal:cp,pais:"Portugal"}});
    else await prisma.endereco.create({data:{userId:u.id,linha1,cidade,codigoPostal:cp,pais:"Portugal",principal:true}});
  }

  type DemoOrderItem = readonly [sku: string, quantidade: number];
  type DemoOrder = readonly [
    numero: string,
    email: string,
    estado: string,
    pagamento: string,
    entrega: string,
    portes: number,
    desconto: number,
    diasAtras: number,
    itens: readonly DemoOrderItem[],
  ];

  const orders: readonly DemoOrder[] = [
    ["ECL-DEMO-1001","ana.silva@demo.pt","ENTREGUE","CARTAO","TRANSPORTADORA",45,0,24,[['SOF-001',1],['MCT-001',1]]],
    ["ECL-DEMO-1002","joao.martins@demo.pt","ENVIADA","MBWAY","TRANSPORTADORA",35,25,8,[['MJT-002',1],['CAD-002',4]]],
    ["ECL-DEMO-1003","marta.costa@demo.pt","EM_PREPARACAO","MULTIBANCO","ENTREGA_LOJA",59,0,4,[['CAM-001',1],['COM-001',1]]],
    ["ECL-DEMO-1004","decor.norte@demo.pt","PAGA","CARTAO","LEVANTAMENTO",0,75,2,[['CAD-001',2],['CAN-001',2]]],
    ["ECL-DEMO-1005","hotel.ria@demo.pt","ENTREGUE","MULTIBANCO","ENTREGA_LOJA",129,150,46,[['ROP-001',2],['CAM-001',3]]],
    ["ECL-DEMO-1006","miguel.sousa@demo.pt","PENDENTE","MBWAY","TRANSPORTADORA",29,0,0,[['MTV-001',1]]],
    ["ECL-DEMO-1007","ana.silva@demo.pt","ENTREGUE","CARTAO","LEVANTAMENTO",0,0,70,[['TAP-001',1],['CAN-001',1]]],
    ["ECL-DEMO-1008","decor.norte@demo.pt","CANCELADA","CARTAO","TRANSPORTADORA",39,0,18,[['CON-001',2]]],
  ] as const;

  for (const [numero,email,estado,pagamento,entrega,portes,desconto,ago,itens] of orders) {
    const subtotal=itens.reduce((s,[sku,q])=>s+Number(productMap[sku].preco)*q,0);
    const total=subtotal+portes-desconto;
    const paga=!['PENDENTE','CANCELADA'].includes(estado);
    const enviada=['ENVIADA','ENTREGUE'].includes(estado);
    await prisma.encomenda.upsert({
      where:{numero},
      update:{estado:estado as any, metodoPagamento:pagamento as any, metodoEntrega:entrega as any, subtotal:d(subtotal),portes:d(portes),desconto:d(desconto),total:d(total)},
      create:{numero,userId:users[email],estado:estado as any,metodoPagamento:pagamento as any,metodoEntrega:entrega as any,clienteNome:clientes.find(c=>c[0]===email)?.[1],clienteEmail:email,clienteTelefone:clientes.find(c=>c[0]===email)?.[3],subtotal:d(subtotal),portes:d(portes),desconto:d(desconto),total:d(total),moradaEntrega:entrega==='LEVANTAMENTO'?'Levantamento no armazém':`${clientes.find(c=>c[0]===email)?.[5]}, ${clientes.find(c=>c[0]===email)?.[7]} ${clientes.find(c=>c[0]===email)?.[6]}`,nifFatura:clientes.find(c=>c[0]===email)?.[4],pagaEm:paga?daysAgo(ago):null,faturadaEm:paga?daysAgo(Math.max(0,ago-1)):null,enviadaEm:enviada?daysAgo(Math.max(0,ago-3)):null,dhlTrackingNumber:enviada?`DHLDEMO${numero.slice(-4)}`:null,createdAt:daysAgo(ago),itens:{create:itens.map(([sku,q]): Prisma.EncomendaItemUncheckedCreateWithoutEncomendaInput => ({produtoId:productMap[sku].id,quantidade:q,precoUnitario:productMap[sku].preco}))}},
    });
  }

  const reviews=[['ana.silva@demo.pt','SOF-001',5,'Muito confortável e exatamente como nas fotografias.'],['joao.martins@demo.pt','MJT-002',4,'Mesa robusta e extensão muito prática.'],['marta.costa@demo.pt','CAM-001',5,'Boa qualidade e montagem simples.'],['miguel.sousa@demo.pt','MTV-001',4,'Acabamento bonito e entrega cuidada.']] as const;
  for(const [email,sku,rating,texto] of reviews) await prisma.review.upsert({where:{userId_produtoId:{userId:users[email],produtoId:productMap[sku].id}},update:{rating,texto,aprovado:true},create:{userId:users[email],produtoId:productMap[sku].id,rating,texto,aprovado:true}});

  await prisma.cupao.upsert({where:{codigo:'BEMVINDO10'},update:{ativo:true},create:{codigo:'BEMVINDO10',tipo:'PERCENTAGEM',desconto:d(10),dataInicio:daysAgo(30),dataFim:new Date(Date.now()+90*86400000),maximo:500,compraMinima:d(150),ativo:true}});
  await prisma.cupao.upsert({where:{codigo:'CASANOVA25'},update:{ativo:true},create:{codigo:'CASANOVA25',tipo:'VALOR_FIXO',desconto:d(25),dataInicio:daysAgo(10),dataFim:new Date(Date.now()+60*86400000),maximo:100,compraMinima:d(300),ativo:true}});

  console.log('Demonstração criada: 16 produtos, 6 clientes, 8 encomendas e 4 avaliações.');
  console.log('Admin: admin@eclove.pt / admin123');
  console.log('Cliente: ana.silva@demo.pt / cliente123');
}

main().finally(()=>prisma.$disconnect()).catch((e)=>{console.error(e);process.exit(1)});
