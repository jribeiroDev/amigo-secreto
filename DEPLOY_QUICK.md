# 🚀 Deploy Rápido - Netlify

## ⚡ Solução Rápida para "Cannot find module"

Se você está vendo erro `Cannot find module 'nodemailer'`, faça isto:

### Windows (PowerShell):

```powershell
# 1. Instalar dependências
cd netlify\functions
npm install
cd ..\..

# 2. Adicionar ao git
git add netlify/functions/package.json
git add netlify/functions/package-lock.json
git add netlify/functions/node_modules
git commit -m "add functions dependencies"
git push

# 3. Build e deploy
npm run build
netlify deploy --prod
```

### Ou use o script automático:

```powershell
.\deploy.ps1
```

---

## 📋 Checklist Antes do Deploy

- [ ] Dependências instaladas em `netlify/functions`
- [ ] Arquivos commitados no git
- [ ] Variáveis de ambiente configuradas no Netlify:
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`
- [ ] Build funciona localmente (`npm run build`)

---

## 🎯 Deploy Passo a Passo

### 1️⃣ Primeira vez (Setup)

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar
netlify init
```

### 2️⃣ Configurar Variáveis de Ambiente

No painel do Netlify ou via CLI:

```bash
netlify env:set GMAIL_USER "seu-email@gmail.com"
netlify env:set GMAIL_APP_PASSWORD "sua-senha-de-app"
```

### 3️⃣ Preparar Functions

```bash
cd netlify/functions
npm install
cd ../..
```

### 4️⃣ Commit (IMPORTANTE!)

```bash
git add netlify/functions/
git commit -m "add functions with dependencies"
git push
```

### 5️⃣ Build

```bash
npm run build
```

### 6️⃣ Deploy

```bash
netlify deploy --prod
```

---

## 🔍 Verificar Deploy

1. **Ver logs do build:**

   ```bash
   netlify watch
   ```

2. **Ver logs da function:**

   ```bash
   netlify functions:log send-email
   ```

3. **Testar endpoint:**
   ```bash
   curl -X POST https://SEU-SITE.netlify.app/api/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "to": "teste@example.com",
       "giverName": "João",
       "receiverName": "Maria",
       "eventName": "Teste",
       "giftPrice": "50"
     }'
   ```

---

## ⚠️ Erros Comuns e Soluções

### Erro: "Cannot find module 'nodemailer'"

**Solução:**

```bash
cd netlify/functions && npm install
git add netlify/functions/node_modules
git commit -m "add dependencies" && git push
netlify deploy --prod
```

### Erro: 502 Bad Gateway

**Soluções:**

1. Verifique variáveis de ambiente no Netlify
2. Veja logs: `netlify functions:log send-email`
3. Teste localmente: `netlify dev`

### Build falha

**Solução:**

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 💡 Dicas

1. **Use o script de deploy** (`deploy.ps1` ou `deploy.sh`)
2. **Sempre commit as dependências** das functions
3. **Configure variáveis ANTES** do primeiro deploy
4. **Teste localmente** com `netlify dev` antes de fazer deploy
5. **Monitore os logs** após cada deploy

---

## 🆘 Ainda com Problemas?

Veja o guia completo: [NETLIFY_TROUBLESHOOTING.md](./NETLIFY_TROUBLESHOOTING.md)

Ou verifique:

- [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) - Setup completo
- [NETLIFY_BLOBS_SETUP.md](./NETLIFY_BLOBS_SETUP.md) - Configuração do Blobs
