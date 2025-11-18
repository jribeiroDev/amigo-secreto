# 📧 Configuração do Gmail SMTP - Guia Completo

## 🎯 Visão Geral

Este guia mostra como configurar o envio de emails usando SMTP do Gmail diretamente, sem serviços terceiros como EmailJS.

**Vantagens:**

- ✅ Envio direto do seu Gmail
- ✅ Sem limites de emails (dentro das políticas do Gmail)
- ✅ Gratuito
- ✅ Controle total sobre os emails
- ✅ Template HTML personalizado

---

## 📋 Passo 1: Criar Senha de App do Gmail

O Gmail não permite mais login com senha normal para apps. Você precisa criar uma **Senha de App**.

### 1.1 Habilitar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Na seção "Como fazer login no Google", clique em **"Verificação em duas etapas"**
3. Siga as instruções para ativar (se ainda não estiver ativa)

### 1.2 Criar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
   - Ou: Google Account → Segurança → Verificação em 2 etapas → Senhas de app
2. Pode pedir para fazer login novamente
3. Em "Selecionar app", escolha **"Outro (nome personalizado)"**
4. Digite: `Amigo Secreto` ou `Nodemailer`
5. Clique em **"Gerar"**
6. **COPIE A SENHA** exibida (16 caracteres, sem espaços)
   - Exemplo: `abcd efgh ijkl mnop`
   - Use sem espaços: `abcdefghijklmnop`

⚠️ **IMPORTANTE**: Guarde esta senha em local seguro. Ela só é exibida uma vez!

---

## 🔧 Passo 2: Configurar o Servidor Backend

### 2.1 Instalar Dependências

```bash
cd server
npm install
```

Isso instalará:

- `express` - Servidor web
- `nodemailer` - Envio de emails SMTP
- `cors` - Permitir requisições do frontend
- `dotenv` - Gerenciar variáveis de ambiente

### 2.2 Criar Arquivo .env

Na pasta `server/`, crie um arquivo chamado `.env`:

```bash
# Na pasta server/
New-Item .env -ItemType File
```

### 2.3 Adicionar Credenciais

Edite o arquivo `server/.env` e adicione:

```env
# Seu email do Gmail
GMAIL_USER=seu-email@gmail.com

# A senha de app que você gerou (SEM ESPAÇOS)
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Porta do servidor (padrão 3001)
PORT=3001
```

**Exemplo real:**

```env
GMAIL_USER=joao.silva@gmail.com
GMAIL_APP_PASSWORD=xpto1234abcd5678
PORT=3001
```

### 2.4 Iniciar o Servidor

```bash
cd server
npm start
```

Você deve ver:

```
🚀 Servidor rodando na porta 3001
📧 Email: seu-email@gmail.com
✅ Servidor pronto para enviar emails via Gmail
🔗 Health check: http://localhost:3001/api/health
```

---

## 🚀 Passo 3: Testar a Configuração

### 3.1 Testar o Servidor

Abra outro terminal e teste:

```bash
# Verificar se o servidor está rodando
curl http://localhost:3001/api/health
```

Deve retornar:

```json
{
  "status": "ok",
  "message": "Servidor de email funcionando",
  "timestamp": "2025-11-18T..."
}
```

### 3.2 Testar Envio de Email

Use o aplicativo Amigo Secreto normalmente:

1. Inicie o frontend: `npm run dev` (na pasta principal)
2. Acesse: http://localhost:5173/
3. Adicione participantes com emails válidos
4. Realize o sorteio
5. Clique em "📧 Enviar por Email"

---

## 📝 Estrutura do Projeto

```
amigo-secreto/
├── server/                        # Servidor backend
│   ├── server.js                  # Código do servidor Express + Nodemailer
│   ├── package.json               # Dependências do servidor
│   ├── .env                       # Credenciais (NÃO COMMITAR!)
│   └── .env.example               # Template de exemplo
├── src/                           # Frontend React
│   └── services/
│       └── emailService.js        # Atualizado para usar o backend
└── package.json                   # Frontend
```

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **NUNCA commite o arquivo `.env`**

   - Já está no `.gitignore`
   - Contém suas credenciais

2. **Use senha de app, NÃO sua senha real**

   - Senhas de app podem ser revogadas
   - Mais seguro

3. **Revogue senhas antigas**

   - Se não usar mais, revogue em: https://myaccount.google.com/apppasswords

4. **Não compartilhe o `.env`**
   - Cada pessoa deve ter suas próprias credenciais

### ⚠️ Limitações do Gmail

O Gmail tem limites de envio:

- **Contas pessoais**: ~500 emails/dia
- **Google Workspace**: ~2000 emails/dia
- **Delay recomendado**: 1 segundo entre emails

O servidor já implementa delay de 1 segundo automaticamente.

---

## 🛠️ Solução de Problemas

### ❌ Erro: "Invalid login"

**Causa**: Senha de app incorreta ou não configurada

**Solução**:

1. Verifique se a verificação em 2 etapas está ativa
2. Crie uma nova senha de app
3. Copie sem espaços no `.env`
4. Reinicie o servidor

### ❌ Erro: "Failed to fetch"

**Causa**: Servidor backend não está rodando

**Solução**:

```bash
cd server
npm start
```

### ❌ Erro: "ECONNREFUSED"

**Causa**: Problema de conexão com o Gmail

**Solução**:

1. Verifique sua conexão com internet
2. Tente com outro email/senha de app
3. Verifique se o Gmail não bloqueou seu IP

### ❌ Emails não chegam

**Verifique**:

1. Pasta de SPAM
2. Email correto no campo "to"
3. Console do servidor para erros
4. Limite diário do Gmail não excedido

### ❌ Erro: "Module not found"

**Solução**:

```bash
cd server
rm -rf node_modules
npm install
```

---

## 📊 Endpoints da API

### GET `/api/health`

Verifica se o servidor está funcionando

**Resposta:**

```json
{
  "status": "ok",
  "message": "Servidor de email funcionando",
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### POST `/api/send-email`

Envia um email único

**Request:**

```json
{
  "to": "email@exemplo.com",
  "giverName": "João",
  "receiverName": "Maria",
  "eventName": "Amigo Secreto 2025",
  "giftPrice": "50.00",
  "eventDate": "2025-12-25"
}
```

**Resposta:**

```json
{
  "success": true,
  "messageId": "<abc123@gmail.com>",
  "recipient": "email@exemplo.com"
}
```

### POST `/api/send-batch-emails`

Envia múltiplos emails (com delay de 1s entre cada)

**Request:**

```json
{
  "emails": [
    {
      "to": "email1@exemplo.com",
      "giverName": "João",
      "receiverName": "Maria",
      "eventName": "Amigo Secreto 2025",
      "giftPrice": "50.00"
    },
    {
      "to": "email2@exemplo.com",
      "giverName": "Pedro",
      "receiverName": "Ana",
      "eventName": "Amigo Secreto 2025",
      "giftPrice": "50.00"
    }
  ]
}
```

**Resposta:**

```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [...]
}
```

---

## 🎨 Personalizar Template de Email

O template HTML está em `server/server.js` na função `sendSingleEmail()`.

Você pode personalizar:

- Cores
- Layout
- Conteúdo
- Imagens (use URLs públicas)

---

## 🚀 Produção (Deploy)

### Opções de Deploy:

1. **Heroku** (gratuito)
2. **Railway** (gratuito)
3. **Render** (gratuito)
4. **DigitalOcean** (pago)
5. **AWS/Google Cloud** (pago)

### Variáveis de Ambiente no Deploy:

Configure no painel do serviço:

```
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app
PORT=3001
```

---

## ✅ Checklist Final

- [ ] Verificação em 2 etapas ativada no Gmail
- [ ] Senha de app criada
- [ ] Arquivo `.env` criado na pasta `server/`
- [ ] Credenciais adicionadas no `.env`
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor iniciado (`npm start`)
- [ ] Teste realizado (health check)
- [ ] Email de teste enviado com sucesso

---

## 📚 Recursos Adicionais

- [Nodemailer Docs](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Senhas de App do Google](https://support.google.com/accounts/answer/185833)

---

## 💡 Dicas

1. **Teste primeiro** com seu próprio email
2. **Use email profissional** para eventos grandes
3. **Monitore** o console do servidor para erros
4. **Backup**: Mantenha lista de participantes em arquivo
5. **Horário**: Evite enviar tarde da noite (pode ir para SPAM)

---

✅ **Pronto! Seu sistema de envio via Gmail SMTP está configurado!**

Dúvidas? Consulte a seção de solução de problemas acima.
