# Eclove

Loja de mobiliário (venda de novos + revenda a profissionais) com front office e backoffice.

Preços: só contas profissionais aprovadas veem valores. Clientes finais (B2C) veem "preço sob consulta" e pedem orçamento em `/contacto`.

## Stack
- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma
- NextAuth (Auth.js) — papéis: CLIENTE, PROFISSIONAL, ADMIN
- Tailwind CSS
- Stripe (pagamentos)
- Resend (emails transacionais)

## 1. Base de dados
Precisas de uma base de dados PostgreSQL. Mais simples: criar uma grátis em
[neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com) — copia o
"connection string" para `DATABASE_URL` no `.env`.

## 2. Stripe
Cria conta em [stripe.com](https://stripe.com) (modo de teste). Copia as chaves
`STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY` do dashboard. Para o webhook em
desenvolvimento local, corre `stripe listen --forward-to localhost:3000/api/checkout/webhook`
(precisa do Stripe CLI) e copia o `STRIPE_WEBHOOK_SECRET` que aparece.

## 3. Emails (opcional para começar)
Cria conta grátis em [resend.com](https://resend.com) e copia a `RESEND_API_KEY`.
Sem esta chave, os emails ficam só registados na consola (não é erro).

## Instalação

```bash
npm install
cp .env.example .env       # preencher as variáveis acima
npx prisma migrate dev --name init
npm run seed                # cria admin de exemplo + 2 produtos + 2 categorias
npm run dev
```

Login admin de teste: `admin@eclove.pt` / `admin123` — **muda a password antes de produção**.

## O que já está feito
- Catálogo com preço sob consulta (B2C) vs preço profissional (B2B aprovado)
- Registo e login de clientes finais (`/registo`, `/entrar`)
- Registo de conta profissional com aprovação manual (`/registo-profissional`)
- Carrinho de compras (só profissionais aprovados podem comprar online)
- Checkout com Stripe + webhook que confirma o pagamento
- Área de conta com histórico de encomendas (`/conta`)
- Backoffice: dashboard, gestão de produtos (com upload de imagem), gestão de
  encomendas (mudar estado), aprovação/rejeição de profissionais
- Emails automáticos: novo pedido profissional (para admin), decisão de aprovação,
  confirmação de encomenda paga, mudança de estado da encomenda

## O que falta / próximos passos sugeridos
1. **Faturação legal** — `lib/faturacao.ts` tem a estrutura pronta; falta escolher
   e integrar um serviço certificado pela Autoridade Tributária (Vendus, InvoiceXpress, Moloni)
2. **Upload de imagens em produção** — atualmente grava em `/public/uploads`, o que
   não é persistente em plataformas como a Vercel; trocar para Cloudinary, S3 ou UploadThing
3. **Múltiplas imagens por produto** e galeria na ficha de produto
4. **Filtros e pesquisa** no catálogo (por categoria, preço, material)
5. **Testes automatizados** antes de ir para produção
6. Deploy: Vercel (app) + Neon/Supabase (BD) + Stripe (modo live) + Resend (domínio verificado)

## Estrutura
```
app/
  page.tsx                        catálogo
  produtos/[id]/                  ficha de produto
  carrinho/                       carrinho
  checkout/                       checkout + sucesso
  entrar/ registo/                autenticação B2C
  registo-profissional/           pedido de conta B2B
  contacto/                       pedido de orçamento (B2C)
  conta/                          área de cliente
  admin/
    dashboard/ produtos/ produtos/novo/ encomendas/ profissionais/
  api/
    produtos/ carrinho/ checkout/ (+ webhook) registo/ registo-profissional/
    categorias/ admin/produtos/ admin/encomendas/ admin/profissionais/ admin/upload/

lib/
  prisma.ts        cliente da BD
  auth.ts          configuração de autenticação
  precos.ts        lógica de preço B2C (sob consulta) vs B2B
  stripe.ts         cliente Stripe
  email.ts         envio de emails transacionais (Resend)
  faturacao.ts     placeholder para integração de faturação

prisma/
  schema.prisma    modelo de dados completo
  seed.ts          dados de teste
```
