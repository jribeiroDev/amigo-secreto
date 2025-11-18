# 🔧 Troubleshooting - Deploy Netlify

## ❌ Problema: Erro 502 (Bad Gateway)

### Causas Possíveis:

1. **Variáveis de ambiente não configuradas**
2. **Timeout da função (limite de 10s no plano gratuito)**
3. **Dependências não instaladas**
4. **Erro no código**

### ✅ Soluções:

#### 1. Verificar Variáveis de Ambiente

No painel do Netlify:
- Site settings → Environment variables
- Verifique se `GMAIL_USER` e `GMAIL_APP_PASSWORD` estão configuradas
- **IMPORTANTE**: Após adicionar, faça um novo deploy!

```bash
# Verificar no deploy logs se as variáveis estão disponíveis
netlify deploy --prod
```

#### 2. Verificar Logs da Function

1. Acesse o painel do Netlify
2. Vá em **Functions** → **send-email**
3. Clique em **Function logs**
4. Procure por erros como:
   - `❌ Variáveis de ambiente não configuradas`
   - `❌ Erro ao conectar ao Gmail`
   - `❌ Timeout`

#### 3. Instalar Dependências

```bash
cd netlify/functions
npm install
```

Certifique-se que `package.json` tem:
```json
{
  "type": "module",
  "dependencies": {
    "nodemailer": "^6.9.7",
    "@netlify/blobs": "^7.0.0"
  }
}
```

#### 4. Deploy com Build Correto

```bash
# Na raiz do projeto
npm run build
netlify deploy --prod
```

## ❌ Problema: TypeError - Cannot redefine property: ethereum

Este erro é causado por conflito com extensões de carteira cripto (MetaMask, etc).

### ✅ Solução:

**Não afeta o funcionamento no Netlify!** Este é um erro local do browser.

Para testar localmente sem o erro:
1. Use navegador em modo anônimo
2. Ou desative extensões de cripto
3. Ou ignore (não afeta produção)

## ❌ Problema: Emails não chegam

### Verificações:

1. **Senha de App do Gmail está correta?**
   ```bash
   # Teste localmente primeiro
   cd server
   npm start
   # Em outro terminal
   npm run dev
   ```

2. **Email está no spam?**
   - Verifique a pasta de spam do destinatário

3. **Limite do Gmail atingido?**
   - Verifique os logs: `📊 Email contador: X/450`
   - Gmail tem limite de 500 emails/dia

4. **Erro no transporter?**
   - Logs devem mostrar: `✅ Email enviado com sucesso`

## ❌ Problema: Function Timeout (10 segundos)

### Causa:
Plano gratuito do Netlify limita functions a 10 segundos.

### ✅ Solução:

O código já está otimizado com:
- Retry com backoff exponencial (máx 3 tentativas)
- Timeout total: ~7 segundos (dentro do limite)

Se ainda assim houver timeout:

1. **Reduzir tentativas de retry:**
   ```javascript
   // Em send-email.js
   async function sendEmailWithRetry(transporter, mailOptions, maxRetries = 2) {
   ```

2. **Upgrade para plano Pro:**
   - Function timeout: 26 segundos
   - Mais recursos

## ❌ Problema: Netlify Blobs não funciona localmente

### Explicação:
Netlify Blobs **só funciona em produção** no Netlify.

### ✅ Solução:

O código já está preparado com **fallback automático**:
- **Local/Dev**: Usa cache em memória
- **Produção Netlify**: Usa Netlify Blobs

Para testar com Blobs localmente:
```bash
netlify dev
```

## 📊 Como Debugar

### 1. Verificar Logs em Tempo Real

```bash
netlify functions:log send-email
```

### 2. Testar Localmente com Netlify Dev

```bash
# Simula ambiente Netlify
netlify dev

# Em outro terminal, teste
curl -X POST http://localhost:8888/.netlify/functions/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "teste@example.com",
    "giverName": "João",
    "receiverName": "Maria",
    "eventName": "Amigo Secreto 2025",
    "giftPrice": "50",
    "eventDate": "2025-12-25"
  }'
```

### 3. Verificar Build

```bash
# Ver logs do build
netlify build

# Ver status do site
netlify status
```

## ✅ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] `npm run build` funciona sem erros
- [ ] Variáveis de ambiente configuradas no Netlify
- [ ] `netlify/functions/package.json` tem `"type": "module"`
- [ ] Dependências instaladas em `netlify/functions/node_modules`
- [ ] Senha de app do Gmail está correta
- [ ] `netlify.toml` está configurado corretamente

## 🔍 Comandos Úteis

```bash
# Ver status do deploy
netlify status

# Ver logs das functions
netlify functions:list
netlify functions:log send-email

# Testar localmente
netlify dev

# Deploy de teste
netlify deploy

# Deploy de produção
netlify deploy --prod

# Ver variáveis de ambiente
netlify env:list
```

## 📝 Exemplo de Logs Corretos

Quando tudo está funcionando:

```
🚀 Iniciando handler de envio de email
📊 Verificando limite diário...
✅ Limite OK: { allowed: true, remaining: 449, limit: 450, current: 1 }
📧 Tentativa 1/3 - Enviando para teste@example.com
✅ Email enviado com sucesso para teste@example.com
✅ Email enviado, incrementando contador...
📊 Email contador: 2/450 (restam 448)
✅ Sucesso! Stats: { date: '2025-11-18', sent: 2, remaining: 448 }
```

## 🆘 Ainda com Problemas?

1. **Verifique os logs completos** no painel do Netlify
2. **Teste localmente primeiro** com `npm run server` + `npm run dev`
3. **Verifique a senha de app** do Gmail
4. **Certifique-se** que as variáveis estão no Netlify (não no código)
5. **Refaça o deploy** após qualquer mudança de variável

## 📞 Links Úteis

- [Netlify Functions Logs](https://app.netlify.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Netlify Blobs Docs](https://docs.netlify.com/blobs/overview/)
- [Nodemailer Docs](https://nodemailer.com/)
