# eclove

Showroom profissional e plataforma de revenda eclove.

## Desenvolvimento local

Pasta habitual: `D:\eclove-shop`

```powershell
cd D:\eclove-shop
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Aplicação local: `http://localhost:3002`

## Limpar o Explorer do VS Code

Quando um ZIP e extraído por cima da pasta existente, o Windows substitui ficheiros, mas não elimina os antigos. Depois de extrair esta versão, execute:

```powershell
cd D:\eclove-shop
npm run clean:explorer
```

No VS Code: `Ctrl + Shift + P` → `Developer: Reload Window`.

O script remove documentação antiga, SQL temporário e cache `.next`. A pasta `node_modules` é preservada, mas fica escondida no Explorer.

## Validação

```powershell
npx prisma generate
npm run typecheck
npm run build
```

As credenciais ficam em `.env`/`.env.local` e não devem ser enviadas para o Git.

## Códigos postais

O preenchimento de rua e localidade usa uma base local dividida por prefixos em `public/dados/codigos-postais`. A pesquisa é automática após os sete algarismos e não depende de uma API externa.

## Email do site

O projeto usa o Resend. Os pedidos de acesso, encomendas e respostas são centralizados em `geral@eclove.pt`.

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Eclove <geral@eclove.pt>"
EMAIL_ADMIN="geral@eclove.pt"
EMAIL_REPLY_TO="geral@eclove.pt"
```

O domínio `eclove.pt` deve estar verificado no Resend. O endereço `geral@eclove.pt` deve existir como caixa de correio ou reencaminhamento para receber respostas.

## Vercel

No projeto Vercel, abra `Settings` → `Environment Variables`. Coloque os valores sem aspas e selecione inicialmente `Production`.

Obrigatórias para a publicação atual:

```text
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_SITE_URL
RESEND_API_KEY
EMAIL_FROM
EMAIL_ADMIN
EMAIL_REPLY_TO
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER
SAGE_MODE
```

Valores recomendados depois de o domínio estar ligado:

```text
NEXTAUTH_URL=https://eclove.pt
NEXT_PUBLIC_SITE_URL=https://eclove.pt
EMAIL_FROM=Eclove <geral@eclove.pt>
EMAIL_ADMIN=geral@eclove.pt
EMAIL_REPLY_TO=geral@eclove.pt
SAGE_MODE=disabled
```

Em `Settings` → `Build & Deployment`:

```text
Framework Preset: Next.js
Root Directory: vazio
Install Command: npm install
Build Command: npm run vercel-build
Output Directory: vazio
```

Depois de alterar variáveis, faça um novo deployment.
