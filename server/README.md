# 📧 Servidor de Email - Gmail SMTP

Servidor backend Node.js com Express e Nodemailer para envio de emails via Gmail SMTP.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Criar arquivo .env (copie do .env.example)
# Edite com suas credenciais

# Iniciar servidor
npm start
```

## ⚙️ Configuração

1. **Criar senha de app do Gmail**

   - Acesse: https://myaccount.google.com/apppasswords
   - Ative verificação em 2 etapas
   - Crie senha para "app personalizado"

2. **Configurar .env**
   ```env
   GMAIL_USER=seu-email@gmail.com
   GMAIL_APP_PASSWORD=sua-senha-de-app
   PORT=3001
   ```

## 📡 Endpoints

### GET `/api/health`

Verifica status do servidor

**Resposta:**

```json
{
  "status": "ok",
  "message": "Servidor de email funcionando"
}
```

### POST `/api/send-email`

Envia email único

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

### POST `/api/send-batch-emails`

Envia múltiplos emails (com delay)

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
    }
  ]
}
```

## 🛠️ Tecnologias

- **Express** - Framework web
- **Nodemailer** - Envio de emails SMTP
- **CORS** - Cross-origin requests
- **dotenv** - Variáveis de ambiente

## 📝 Limitações do Gmail

- Contas pessoais: ~500 emails/dia
- Google Workspace: ~2000 emails/dia
- Delay recomendado: 1 segundo entre emails

## 🔒 Segurança

- ✅ Use senha de app (não sua senha real)
- ✅ Nunca commite o arquivo `.env`
- ✅ Revogue senhas não utilizadas

## 📚 Documentação

Veja o guia completo: `../GMAIL_SMTP_SETUP.md`
