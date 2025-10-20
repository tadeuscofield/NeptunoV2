# 👨‍💼 Guia do Painel Admin - NEPTUNO

## 🎯 Acesso ao Painel

### URL:
- **Local:** `file:///C:/Users/tadec/OneDrive/Área de Trabalho/NEPTUNOV2/frontend/admin.html`
- **Produção:** `https://www.neptunodescom.com/admin.html` (após deploy)

### Chave de Admin:
**Padrão:** `NEPTUNO_ADMIN_2025`

⚠️ **IMPORTANTE:** Mude esta chave em produção!

**Como mudar:**
1. Acesse Railway → Projeto NEPTUNO-V2 → aware-comfort
2. Variables → Add Variable
3. Nome: `ADMIN_KEY`
4. Valor: `SuaChaveSuperSecreta123!`
5. Redeploy

---

## 📊 Visão Geral do Painel

### Dashboard Principal

O painel mostra 4 métricas principais:

1. **Total Trials** 📊 - Todos os trials criados
2. **Ativos** ✅ - Trials em uso (dentro das 72h)
3. **Pendentes** ⏳ - Solicitados mas não ativados
4. **Expirados** ⏰ - Trials que passaram das 72h

---

## 🔍 Filtros

Click nos botões para filtrar visualização:

- **Todos** - Mostra todos os trials
- **Pendentes** - Apenas PENDING
- **Ativos** - Apenas ACTIVE
- **Expirados** - Apenas EXPIRED
- **Convertidos** - Apenas CONVERTED (clientes pagos)

---

## 📋 Tabela de Trials

### Colunas:

1. **Nome** - Nome completo do usuário
2. **Email** - Email cadastrado
3. **Empresa** - Empresa/Instituição
4. **Código** - Código de acesso (NEPT-XXXXXX)
5. **Status** - Badge colorido:
   - 🟡 PENDING (amarelo)
   - 🟢 ACTIVE (verde)
   - 🔴 EXPIRED (vermelho)
   - 🔵 CONVERTED (azul)
6. **Expira Em** - Data/hora ou tempo restante
7. **Ações** - Botão para abrir menu

---

## ⚙️ Ações Disponíveis

### Para cada trial, você pode:

### 1️⃣ **Estender +24h**
- Adiciona 24 horas ao prazo do trial
- Útil para demos longas ou eventos

**Quando usar:**
- Cliente pediu mais tempo
- Está em negociação
- Problemas técnicos do cliente

### 2️⃣ **Estender +72h**
- Adiciona 72 horas (mais 3 dias)
- Basicamente renova o trial

**Quando usar:**
- Cliente muito interessado
- Processo de compra demorado
- Avaliação técnica extensa

### 3️⃣ **Marcar como Convertido**
- Muda status para CONVERTED
- Indica que virou cliente pagante
- **NÃO deleta o trial** (mantém histórico)

**Quando usar:**
- Cliente fechou contrato
- Pagamento confirmado
- Quer manter histórico de conversão

### 4️⃣ **Deletar (LGPD)**
- **DELETA PERMANENTEMENTE** todos os dados
- Ação **IRREVERSÍVEL**
- Compliance com direito ao esquecimento

**Quando usar:**
- Cliente solicitou exclusão (lgpd@neptunodescom.com)
- Dados spam/falsos
- Solicitação ANPD

⚠️ **ATENÇÃO:** Sempre confirme antes de deletar!

---

## 📧 Fluxo de Trabalho Típico

### Cenário 1: Novo Trial Solicitado

1. **Notificação:** Você recebe email do Google Forms
2. **Verificação:** Acesse painel admin
3. **Revisar:** Veja dados do solicitante
4. **Aprovar:** Trial já vem aprovado (is_approved=True)
5. **Aguardar:** Usuário ativa com código

### Cenário 2: Trial Expirou

1. **Filtro:** Click em "Expirados"
2. **Análise:** Usuário usou o sistema?
3. **Contato:** Email perguntando sobre interesse
4. **Ação:**
   - Se interessado → Estender +72h
   - Se converteu → Marcar como CONVERTED
   - Se não quer mais → Deletar (LGPD)

### Cenário 3: Cliente Virou Pago

1. **Localizar:** Busque trial do cliente
2. **Marcar:** Click "Marcar como Convertido"
3. **Histórico:** Trial fica no banco como CONVERTED
4. **Análise:** Acompanhe taxa de conversão

### Cenário 4: Solicitação LGPD

1. **Email:** Cliente enviou para lgpd@neptunodescom.com
2. **Verificar:** Confirme identidade
3. **Localizar:** Ache trial no painel
4. **Deletar:** Click "Deletar (LGPD)"
5. **Confirmar:** Sistema pede confirmação dupla
6. **Responder:** Email confirmando exclusão (15 dias úteis)

---

## 🔄 Atualização dos Dados

### Automática:
- Dados atualizam ao carregar página
- Status EXPIRED atualiza automaticamente no backend

### Manual:
- Click no botão **"🔄 Atualizar"** (canto superior direito)
- Recarrega dados do servidor
- Útil se deixar painel aberto muito tempo

---

## 📊 Métricas e Analytics

### Como acompanhar performance:

**Taxa de Conversão:**
```
Convertidos / Total de Trials × 100%
```

**Exemplo:** 5 convertidos de 20 trials = 25% de conversão

**Taxa de Ativação:**
```
(Ativos + Expirados + Convertidos) / Total × 100%
```

**Taxa de Abandono:**
```
Pendentes / Total × 100%
```

**Tempo Médio de Conversão:**
- Ver `created_at` até mudar para CONVERTED

---

## 🔒 Segurança

### Boas Práticas:

1. **NUNCA compartilhe** a chave de admin
2. **Mude a chave** em produção
3. **Use HTTPS** sempre
4. **Logout** quando terminar
5. **Não deixe painel** aberto em computador público

### Detecção de Problemas:

**Muitas solicitações PENDING:**
- Emails não estão chegando?
- Verifique Google Forms / Apps Script
- Verifique spam do Gmail

**Muitos EXPIRED sem conversão:**
- Sistema não está agregando valor?
- Melhorar onboarding?
- Contato pro-ativo com usuários

**Zero CONVERTED:**
- Processo de compra não está claro?
- Preço muito alto?
- Falta sales follow-up?

---

## 🆘 Troubleshooting

### Problema: "Chave de admin inválida"

**Solução:**
1. Verifique se digitou corretamente
2. Cheque variável ADMIN_KEY no Railway
3. Se mudou recentemente, aguarde redeploy (2-3 min)

### Problema: "Erro ao carregar trials"

**Solução:**
1. Verifique se backend está online (aware-comfort-production.up.railway.app)
2. Teste endpoint manualmente: `curl https://aware-comfort-production.up.railway.app/health`
3. Verifique logs no Railway

### Problema: Botão "Deletar" não funciona

**Solução:**
1. Verifique console do navegador (F12)
2. Confirme que clicou "OK" nas 2 confirmações
3. Verifique permissões de admin

### Problema: Data/hora errada

**Solução:**
- Backend usa UTC
- Frontend converte para local automaticamente
- Se errado, verifique timezone do navegador

---

## 📞 Suporte

### Contatos:

- **Desenvolvedor:** Eng. Tadeu Santana
- **Email:** contato@neptunodescom.com
- **GitHub Issues:** https://github.com/tadeuscofield/NeptunoV2/issues

---

## 🚀 Próximas Melhorias

**Planejado para futuras versões:**

- [ ] Gráficos de conversão ao longo do tempo
- [ ] Export CSV de todos os trials
- [ ] Notificações push quando novo trial chega
- [ ] Envio de email diretamente do painel
- [ ] Histórico de ações do admin (audit log)
- [ ] Múltiplos admins com permissões diferentes
- [ ] Dashboard mobile-friendly

---

**Desenvolvido por Eng. Tadeu Santana**
*NEPTUNO - Offshore Decommissioning*
