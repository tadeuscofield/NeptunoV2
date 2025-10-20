# 🚀 NEPTUNO V2 - Início Rápido

## ✅ VOCÊ ESTÁ AQUI

Projeto limpo e pronto para deploy!

---

## 📦 O QUE FAZER AGORA (10 minutos)

### 1️⃣ Criar Repositório GitHub (2 min)

1. Acesse: https://github.com/new
2. Repository name: `NEPTUNOV2` (ou o que quiser)
3. Description: `NEPTUNO - Sistema PDI ANP 817/2020`
4. **Public** (ou Private se preferir)
5. **NÃO** marque "Add README" (já temos!)
6. Click **"Create repository"**

**COPIE A URL QUE APARECER!**
Exemplo: `https://github.com/tadeuscofield/NEPTUNOV2.git`

---

### 2️⃣ Fazer Push (3 min)

Abra **Git Bash** nesta pasta:

```bash
# 1. Ir para a pasta
cd "C:\Users\tadec\OneDrive\Área de Trabalho\NEPTUNOV2"

# 2. Inicializar Git
git init

# 3. Adicionar todos os arquivos
git add .

# 4. Primeiro commit
git commit -m "🚀 NEPTUNO V2 - Clean production-ready version"

# 5. Conectar ao GitHub (COLE SUA URL AQUI!)
git remote add origin https://github.com/tadeuscofield/NEPTUNOV2.git

# 6. Push
git push -u origin main
```

**Pronto! Código no GitHub!** ✅

---

### 3️⃣ Deploy Railway (5 min)

Siga: **`docs/DEPLOY_RAILWAY.md`**

Resumo:
1. https://railway.app
2. New Project → From GitHub
3. Select NEPTUNOV2
4. Settings → Root Directory: `backend`
5. Add PostgreSQL
6. Generate Domain
7. Testar!

---

### 4️⃣ Deploy Vercel (3 min)

Siga: **`docs/DEPLOY_VERCEL.md`**

Resumo:
1. https://vercel.com
2. Import NEPTUNOV2
3. Root Directory: `frontend`
4. Deploy
5. Configurar domínio comprado

---

## 🎯 RESULTADO FINAL

```
✅ Frontend: https://neptuno.com.br
✅ Backend: https://api.neptuno.com.br
✅ PostgreSQL: Ativo no Railway
✅ SSL: Automático em tudo
✅ Custo: R$ 29/mês
```

---

## 📂 Estrutura do Projeto

```
NEPTUNOV2/
│
├── frontend/              # → Vercel
│   ├── index.html         # SPA principal
│   ├── PDIComponent.jsx   # 8 steps PDI
│   ├── PDICalculos.js     # Motor de cálculos
│   └── branding/          # Logo
│
├── backend/               # → Railway
│   ├── app.py             # Flask API
│   ├── requirements.txt   # Python deps
│   ├── Procfile           # Gunicorn
│   ├── runtime.txt        # Python 3.11.6
│   └── README.md          # Docs backend
│
├── docs/
│   ├── DEPLOY_RAILWAY.md  # Guia Railway
│   └── DEPLOY_VERCEL.md   # Guia Vercel
│
├── .gitignore
├── README.md
└── INICIO_RAPIDO.md       # ← VOCÊ ESTÁ AQUI
```

---

## ❓ FAQ

**P: Preciso instalar algo no meu PC?**
R: Não! Tudo roda na nuvem (Railway + Vercel).

**P: Quanto custa?**
R: Railway $5/mês + Domínio ~$10/ano = ~R$ 29/mês total

**P: E se der erro no Railway?**
R: Veja os **Logs** na aba Deployments. Copie o erro e peça ajuda.

**P: Meu domínio não funciona ainda**
R: DNS demora até 48h (geralmente 1h). Aguarde e limpe cache.

**P: Posso usar Hugging Face em vez de Railway?**
R: Sim, mas Railway tem PostgreSQL. Para começar, Railway é melhor.

---

## 🆘 Precisa de Ajuda?

1. Veja logs no Railway/Vercel
2. Leia `docs/DEPLOY_*.md`
3. Verifique que Root Directory está correto
4. Confirme que arquivos foram para GitHub

---

## 🎉 SUCESSO!

Quando tudo estiver funcionando:

✅ Frontend abre em `neptuno.com.br`
✅ API responde em `api.neptuno.com.br`
✅ Banco de dados PostgreSQL ativo
✅ Deploy automático via Git push

**Você tem um sistema PROFISSIONAL rodando! 🚀**

---

**Desenvolvido por Eng. Tadeu Santana**
**NEPTUNO © 2025**
