# 🚂 Deploy Railway - 5 Minutos

## PASSO 1: Criar Projeto

1. Acesse: **https://railway.app**
2. Login com GitHub
3. Clique **"New Project"**
4. Escolha **"Deploy from GitHub repo"**
5. Selecione seu repositório novo
6. Clique **"Deploy Now"**

## PASSO 2: Configurar Root Directory

1. Clique no serviço que foi criado
2. Vá em **"Settings"**
3. Procure **"Root Directory"**
4. Digite: `backend`
5. Salve

## PASSO 3: Adicionar PostgreSQL

1. No dashboard do projeto, clique **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. Railway conecta automático!

## PASSO 4: Redeploy

1. Volte para o serviço da API
2. Clique **"Redeploy"** ou aguarde deploy automático
3. Aguarde 1-2 minutos

## PASSO 5: Gerar Domain

1. No serviço da API, vá em **"Settings"**
2. Procure **"Domains"**
3. Clique **"Generate Domain"**
4. Copie a URL!

## PASSO 6: Testar

Abra no navegador:
```
https://seu-app.up.railway.app/
```

Deve aparecer:
```json
{
  "status": "online",
  "app": "NEPTUNO ML API",
  "version": "2.1.0"
}
```

## ✅ PRONTO!

**Custo: $5/mês (~R$ 25)**

---

**Problemas?**
- Verifique **Logs** na aba Deployments
- Confirme que Root Directory = `backend`
- Confirme que PostgreSQL está Active
