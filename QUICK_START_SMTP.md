# 🚀 Início Rápido - Gmail SMTP

## ⚡ Configuração em 5 Minutos

### 1️⃣ Criar Senha de App do Gmail

1. Acesse: https://myaccount.google.com/apppasswords
2. Ative a verificação em 2 etapas (se ainda não estiver)
3. Crie uma senha de app para "Outro app personalizado"
4. **COPIE a senha** (16 caracteres)

### 2️⃣ Configurar o Servidor

```bash
# 1. Instalar dependências do servidor
cd server
npm install

# 2. Criar arquivo .env
New-Item .env -ItemType File

# 3. Editar o .env e adicionar:
# GMAIL_USER=seu-email@gmail.com
# GMAIL_APP_PASSWORD=sua-senha-de-app-aqui
# PORT=3001
```

**Exemplo do arquivo `.env`:**

```env
GMAIL_USER=joao@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
PORT=3001
```

### 3️⃣ Iniciar os Servidores

**Terminal 1 - Backend:**

```bash
cd server
npm start
```

Deve aparecer:

```
✅ Servidor pronto para enviar emails via Gmail
🚀 Servidor rodando na porta 3001
```

**Terminal 2 - Frontend:**

```bash
# Na pasta raiz
npm run dev
```

### 4️⃣ Usar o App

1. Abra: http://localhost:5173/
2. Preencha informações do evento
3. Adicione participantes (com emails)
4. Clique em "🎲 Realizar Sorteio"
5. Clique em "📧 Enviar por Email"

---

## 🎯 Scripts Úteis

```bash
# Iniciar apenas frontend
npm run dev

# Iniciar apenas backend
npm run server

# Instalar dependências do servidor
npm run server:install
```

---

## ⚠️ Problemas Comuns

### Servidor não inicia

```bash
cd server
npm install
npm start
```

### Erro "Invalid login"

- Verifique se a senha de app está correta no `.env`
- Certifique-se que não tem espaços na senha

### Erro "Failed to fetch"

- O servidor backend precisa estar rodando
- Execute: `npm run server` em outro terminal

---

## 📧 Formato do Email Enviado

Os participantes receberão um email HTML bonito com:

- 🎁 Título "Amigo Secreto"
- Nome de quem eles tiraram
- Informações do evento
- Valor sugerido
- Data do evento
- Aviso para manter segredo

---

## ✅ Pronto!

Agora você pode enviar emails diretamente do Gmail, sem limites de serviços terceiros!

**Veja o guia completo:** `GMAIL_SMTP_SETUP.md`
