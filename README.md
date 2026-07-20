# Eclove — Plataforma B2B

Loja **exclusivamente para revenda**: lojas e profissionais do setor do mobiliário.
Não existe canal de cliente final aqui — isso vive num site à parte (Mar e Móveis).

Preços só ficam visíveis depois de entrar com uma conta de revenda aprovada.

## Stack
- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma
- NextAuth (Auth.js) — papéis: PROFISSIONAL (revenda), ADMIN
- Tailwind CSS
- Stripe (pagamentos)
- Resend (emails transacionais)

## 1. Base de dados
Cria uma grátis em [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com) — copia o
"connection string" para `DATABASE_URL` no `.env`.

## 2. Stripe
Cria conta em [stripe.com](https://stripe.com) (modo de teste). Copia `STRIPE_SECRET_KEY` e
`STRIPE_PUBLISHABLE_KEY`. Para o webhook local: `stripe listen --forward-to localhost:3000/api/checkout/webhook`.

## 3. Emails (opcional para começar)
Conta grátis em [resend.com](https://resend.com) → `RESEND_API_KEY`. Sem chave, os emails ficam só
registados na consola.

## Instalação

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Login admin de teste: `admin@eclove.pt` / `admin123` — muda a password antes de produção.

## Fluxo de acesso
1. Uma loja/revendedor pede conta em `/registo-profissional` (fica PENDENTE)
2. O admin aprova em `/admin/profissionais`
3. Só depois de aprovado, o utilizador vê preços e pode comprar online

## O que já está feito
- Catálogo com preço oculto até login de revenda aprovado
- Registo e aprovação de contas de revenda
- Carrinho, checkout com Stripe, histórico de encomendas
- Backoffice: dashboard, produtos (criar/editar/desativar, categorias com
  subcategorias), gestão de encomendas, aprovação de revendedores
- Emails automáticos (pedidos, aprovações, encomendas)

## Próximos passos sugeridos
1. Faturação certificada (Vendus, InvoiceXpress, Moloni) — ver `lib/faturacao.ts`
2. Upload de imagens em produção (trocar armazenamento local por Cloudinary/S3)
3. Deploy: Vercel + Neon/Supabase + Stripe (modo live) + Resend

## Estrutura
```
app/
  page.tsx                        catálogo (preço só após login)
  produtos/[id]/                  ficha de produto
  carrinho/ checkout/             compra (só revenda aprovada)
  entrar/                         login
  registo-profissional/           pedido de conta de revenda
  conta/                          área do revendedor (histórico, reencomendar)
  admin/
    dashboard/ produtos/ produtos/novo/ produtos/[id]/editar/
    encomendas/ profissionais/
  api/ ...

lib/
  prisma.ts auth.ts precos.ts stripe.ts email.ts faturacao.ts

prisma/
  schema.prisma    modelo de dados (User, Categoria com subcategorias, Produto, Encomenda...)
  seed.ts          dados de teste
```
