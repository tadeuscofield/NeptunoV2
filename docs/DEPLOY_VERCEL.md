# ▲ Deploy Vercel - 3 Minutos

## PASSO 1: Import Projeto

1. Acesse: **https://vercel.com**
2. Login com GitHub
3. Clique **"Add New..."** → **"Project"**
4. Selecione seu repositório
5. Clique **"Import"**

## PASSO 2: Configurar Build

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `frontend` |
| **Build Command** | (deixe vazio) |
| **Output Directory** | `./` |

## PASSO 3: Deploy

1. Clique **"Deploy"**
2. Aguarde 1-2 minutos
3. Pronto!

## PASSO 4: Usar Domínio Comprado

Você já comprou o domínio! Agora:

1. No projeto Vercel, vá em **"Settings"** → **"Domains"**
2. Clique **"Add"**
3. Digite: `neptuno.com.br` (ou o domínio que você comprou)
4. Vercel configura DNS automático
5. Aguarde 5-30 minutos

## PASSO 5: Configurar Subdomínio API

Para `api.neptuno.com.br` apontar para Railway:

1. Em Domains, clique **"Add"**
2. Digite: `api.neptuno.com.br`
3. Escolha **"Add as CNAME"**
4. Value: Cole a URL do Railway (sem https://)
   - Exemplo: `neptuno-production-abc.up.railway.app`
5. Salve

## ✅ PRONTO!

**Custo: R$ 0 (Vercel) + R$ 50/ano (domínio)**

Acesse:
- Frontend: `https://neptuno.com.br`
- API: `https://api.neptuno.com.br`

---

**Problemas?**
- DNS demora até 48h (geralmente 1h)
- Limpe cache do browser (Ctrl+F5)
- Teste em navegador anônimo
