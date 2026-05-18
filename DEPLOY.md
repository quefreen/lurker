# Deploy Guide — lurker.gg

## Stack
- Next.js 16.x (não atualizar sem motivo — ver nota abaixo)
- Clerk 7.x (`@clerk/nextjs`)
- Turso / libsql (`@libsql/client`)
- Stripe
- Vercel

---

## Variáveis de Ambiente (Vercel → Settings → Environment Variables)

Todas obrigatórias antes do primeiro deploy:

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `TURSO_DATABASE_URL` | Turso Dashboard → Database → URL |
| `TURSO_AUTH_TOKEN` | Turso Dashboard → Database → Tokens |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → endpoint secret |
| `STRIPE_PRICE_ID_MONTHLY` | Stripe Dashboard → Products → price ID |
| `NEXT_PUBLIC_APP_URL` | URL de produção (ex: `https://lurker.gg`) |

**Escopo recomendado:** Clerk e Turso em "Production and Preview". Stripe em "Production" apenas.

---

## Banco de Dados (Turso)

### Autenticar CLI (primeira vez)
```bash
source /Users/quef/.zshrc   # Turso instalado em ~/.turso
turso auth login --headless  # Gera link → abre no browser → copia token → cola no terminal
```

### Rodar migrations
```bash
# Migration 003 — tabela users (já rodada em 2026-05-18)
turso db shell lurker "CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);"
turso db shell lurker "CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);"

# Verificar
turso db shell lurker "SELECT name FROM sqlite_master WHERE type='table' AND name='users';"
```

---

## Stripe

### Webhook
Endpoint: `https://seudominio.com/api/webhooks/stripe`

Eventos necessários:
- `checkout.session.completed`
- `customer.subscription.deleted`

### Produto
- Billing interval: 7 dias (custom interval no Stripe)
- Copiar o `price_id` gerado e colocar em `STRIPE_PRICE_ID_MONTHLY`

---

## Problemas Resolvidos (não repetir)

### `middleware.js.nft.json` ENOENT na Vercel
**Causa:** Next.js 16 mudou o output do middleware para `server/edge/chunks/`. A Vercel ainda esperava `server/middleware.js.nft.json` (formato Next.js 15).
**Fix:** Removido `middleware.ts`. Proteção de rotas feita diretamente nas páginas com `auth() + redirect()` do Clerk.
**Páginas protegidas:** `/checkout/page.tsx` e `/dashboard/page.tsx` já têm o check.

### TypeScript `series_markets` / `round_markets` not in type
**Causa:** Campos novos no JSON de análise não estavam no tipo `MatchAnalysis`.
**Fix:** Adicionar campos opcionais em `src/lib/types.ts`.
**Lembrete:** Sempre que adicionar campos novos ao JSON de análise, atualizar `MatchAnalysis`.

### HeroScene — `'section' is possibly null` + `Cannot find namespace 'THREE'`
**Fix 1:** Recheck `if (!section || !asciiCanvas || !radarCanvas)` dentro do `async function init()`.
**Fix 2:** `import type * as THREE from 'three'` no topo do arquivo para tipagem do import dinâmico.

### SiteNavSmart retornando `null` quebrava Three.js
**Causa:** SSR renderiza `null`, cliente renderiza nav → hydration mismatch → React desmonta árvore → canvas Three.js destruído.
**Fix:** `SiteNavSmart` sempre renderiza `<SiteNav>` como fallback durante carregamento (nunca retorna `null`).

### Clerk middleware `auth.protect()` erros de TypeScript
**Fix:** Usar `const authObj = await auth()` e checar `authObj.userId` manualmente ao invés de `auth.protect()`.

---

## Configuração Next.js (`next.config.ts`)
```ts
serverExternalPackages: ['@libsql/client']
```
Necessário para que o Turso não tente bundlar no Edge Runtime.

---

## Versões Estáveis (testadas em produção)
- `next`: 16.2.4 — **não atualizar sem motivo**
- `@clerk/nextjs`: 7.3.5
- `@libsql/client`: 0.17.2

---

## Checklist pré-deploy
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npx next build` local sem erros
- [ ] Todas as env vars configuradas na Vercel
- [ ] Migrations do Turso rodadas
- [ ] Webhook do Stripe apontando para o domínio correto
