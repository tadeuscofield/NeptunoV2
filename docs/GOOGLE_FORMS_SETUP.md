# 📋 Configuração do Google Forms - NEPTUNO Trial

## 🎯 PASSO A PASSO

### 1️⃣ Criar o Formulário

1. Acesse: https://forms.google.com
2. Click em **"+ Blank form"** (Formulário em branco)
3. Título: **"NEPTUNO - Solicitação de Trial 72h"**
4. Descrição:
   ```
   Sistema Profissional de Plano de Desativação de Instalações (PDI)
   Conforme ANP 817/2020

   Preencha o formulário para receber seu código de acesso gratuito por 72 horas.
   ```

---

### 2️⃣ Adicionar Campos (em ordem)

**Campo 1: Nome Completo**
- Tipo: **Short answer** (Resposta curta)
- Question: `Nome Completo`
- ✅ Required

**Campo 2: Email Profissional**
- Tipo: **Short answer**
- Question: `Email Profissional`
- ✅ Required
- ✅ Response validation → Text → Email

**Campo 3: Empresa/Instituição**
- Tipo: **Short answer**
- Question: `Empresa / Instituição`
- ✅ Required

**Campo 4: Cargo**
- Tipo: **Short answer**
- Question: `Cargo`
- ❌ Optional (não marcar Required)

**Campo 5: Telefone**
- Tipo: **Short answer**
- Question: `Telefone (opcional)`
- ❌ Optional

**Campo 6: Como soube do NEPTUNO?**
- Tipo: **Multiple choice**
- Question: `Como conheceu o NEPTUNO?`
- Opções:
  - LinkedIn
  - Evento/Conferência
  - Indicação
  - Busca no Google
  - Outro

**Campo 7: LGPD Consent**
- Tipo: **Checkboxes**
- Question: `Termos de Uso e Privacidade (LGPD)`
- Opção:
  ```
  Aceito os termos de uso e política de privacidade.
  Meus dados serão utilizados apenas para fornecer acesso ao sistema.
  Posso solicitar exclusão conforme Lei nº 13.709/2018.
  ```
- ✅ Required

---

### 3️⃣ Configurar Aparência

1. Click no **ícone de paleta** (Customize theme)
2. **Header:** Faça upload da logo `NEPTUNO_LOGO.png`
3. **Theme color:** `#1e3a5f` (azul escuro)
4. **Background color:** Branco ou `#f8fafc`
5. **Font style:** Basic ou Modern

---

### 4️⃣ Configurar Respostas

1. Click na aba **"Responses"**
2. ✅ Marque **"Collect email addresses"**
3. ✅ Marque **"Limit to 1 response"** (evita spam)
4. Click em **"Create Spreadsheet"**
   - Nome: `NEPTUNO - Trial Requests`
   - Isso cria uma planilha Google Sheets automaticamente

---

### 5️⃣ Configurar Mensagem de Confirmação

1. Settings (engrenagem) → **Presentation**
2. **Confirmation message:**
   ```
   ✅ Solicitação recebida!

   Você receberá seu código de acesso no email cadastrado em até 2 horas úteis.

   Verifique sua caixa de entrada e spam.

   Seu trial de 72h começa quando você inserir o código em:
   www.neptunodescom.com

   Dúvidas? contato@neptunodescom.com
   ```

---

### 6️⃣ Obter Link do Formulário

1. Click em **"Send"** (canto superior direito)
2. Escolha o ícone de **link** (corrente)
3. ✅ Marque **"Shorten URL"**
4. **COPIE ESTE LINK!** (exemplo: `https://forms.gle/AbC123XyZ`)

---

### 7️⃣ Integrar na Landing Page

Edite o arquivo `frontend/landing.html` e substitua a função `sendToGoogleForms`:

```javascript
function sendToGoogleForms(data) {
  const formUrl = 'https://docs.google.com/forms/d/e/SEU_FORM_ID_AQUI/formResponse';

  const formData = new FormData();
  formData.append('entry.XXXXXX', data.name);        // Substitua XXXXXX pelos IDs reais
  formData.append('entry.YYYYYY', data.email);       // Ver seção 8 abaixo
  formData.append('entry.ZZZZZZ', data.company);
  formData.append('entry.WWWWWW', data.position);
  formData.append('entry.QQQQQQ', data.phone);

  fetch(formUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });
}
```

---

### 8️⃣ Encontrar IDs dos Campos

1. Abra o formulário em modo de edição
2. Click nos 3 pontinhos → **Get pre-filled link**
3. Preencha todos os campos com textos de teste
4. Click em **"Get link"**
5. Copie a URL gerada
6. Ela terá formato:
   ```
   https://docs.google.com/forms/d/e/FORM_ID/viewform?
   entry.123456789=NomeTeste&
   entry.987654321=email@teste.com&
   entry.555555555=EmpresaTeste...
   ```
7. Os números após `entry.` são os IDs que você precisa!

---

### 9️⃣ Configurar Notificações por Email

1. Na planilha `NEPTUNO - Trial Requests`
2. Extensions → Apps Script
3. Cole este código:

```javascript
function sendEmailOnFormSubmit(e) {
  const row = e.values;
  const timestamp = row[0];
  const email = row[1];
  const nome = row[2];
  const empresa = row[3];

  // Gerar código aleatório
  const codigo = 'NEPT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Enviar email
  MailApp.sendEmail({
    to: email,
    subject: '🔱 Seu código de acesso NEPTUNO - Trial 72h',
    htmlBody: `
      <h2>Bem-vindo ao NEPTUNO, ${nome}!</h2>
      <p>Seu código de acesso trial foi gerado:</p>
      <h1 style="background: #1e3a5f; color: white; padding: 20px; text-align: center;">
        ${codigo}
      </h1>
      <p><strong>Válido por: 72 horas</strong></p>
      <p>Acesse: <a href="https://www.neptunodescom.com">www.neptunodescom.com</a></p>
      <p>Insira o código acima para começar.</p>
      <hr>
      <p style="color: gray; font-size: 12px;">
        NEPTUNO - Sistema de PDI conforme ANP 817/2020<br>
        Dúvidas? contato@neptunodescom.com
      </p>
    `
  });

  // Salvar código na planilha (adicionar coluna "Código Enviado")
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, sheet.getLastColumn() + 1).setValue(codigo);
}
```

4. Save (disco)
5. Triggers (relógio) → Add Trigger
   - Function: `sendEmailOnFormSubmit`
   - Event source: **From spreadsheet**
   - Event type: **On form submit**
6. Save → Autorize o acesso

---

### 🔟 Testar!

1. Abra o formulário público
2. Preencha com seus dados de teste
3. Submeta
4. Verifique se:
   - ✅ Dados aparecem na planilha
   - ✅ Email com código foi enviado
   - ✅ Código aparece na planilha

---

## 📊 RESULTADO FINAL

Você terá:

1. ✅ **Formulário público** para capturar leads
2. ✅ **Planilha Google Sheets** com todos os dados
3. ✅ **Email automático** com código de 72h
4. ✅ **Backup dos dados** (além do PostgreSQL)
5. ✅ **Notificações** quando alguém solicita trial

---

## 🔗 LINKS ÚTEIS

- **Tutorial Google Forms:** https://support.google.com/docs/answer/6281888
- **Apps Script Docs:** https://developers.google.com/apps-script
- **MailApp Reference:** https://developers.google.com/apps-script/reference/mail/mail-app

---

## 💡 DICA PRO

Adicione uma coluna na planilha chamada **"Status"** e preencha manualmente:
- `ATIVO` - Trial ativo
- `EXPIRADO` - 72h passaram
- `CONVERTIDO` - Virou cliente
- `REJEITADO` - Não aprovar

Isso facilita o gerenciamento no painel admin!

---

**Desenvolvido por Eng. Tadeu Santana**
*NEPTUNO - Offshore Decommissioning*
