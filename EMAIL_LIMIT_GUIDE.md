# 📊 Sistema de Limite de Emails Diários

## 🎯 Visão Geral

O sistema implementa um contador de emails com limite diário de **450 emails**, conforme as políticas do Gmail para contas gratuitas.

## 🔧 Como Funciona

### Desenvolvimento (Servidor Local)

- Arquivo de contador: `server/email-counter.json`
- Persiste entre reinícios do servidor
- Reseta automaticamente à meia-noite

### Produção (Netlify)

- **Usa Netlify Blobs** para armazenamento persistente
- Persiste entre deploys e cold starts
- Compartilhado entre todas as instâncias da função
- Reset automático à meia-noite

## 📁 Arquivos Criados

1. **`server/emailCounter.js`** - Módulo contador para servidor local (com JSON)
2. **`netlify/functions/emailCounter.js`** - Módulo contador para Netlify (com Blobs)
3. **`server/email-counter.json`** - Arquivo de dados local (auto-gerado)
4. **Netlify Blobs** - Armazenamento persistente na nuvem (auto-gerenciado)

## 🚀 Funcionalidades

### 1. Verificação de Limite

Antes de enviar qualquer email, o sistema verifica:

- Quantos emails foram enviados hoje
- Quantos emails ainda podem ser enviados
- Se o limite diário foi atingido

### 2. Mensagens de Erro

Quando o limite é atingido, o usuário recebe:

```
⚠️ LIMITE DIÁRIO ATINGIDO

Limite diário de 450 emails atingido. Restam 0 emails hoje.

Enviados hoje: 450/450
```

### 3. Contador Automático

- ✅ Incrementa após cada email enviado com sucesso
- ✅ Reseta automaticamente à meia-noite
- ✅ Não conta emails que falharam

### 4. Estatísticas

Endpoint disponível: `GET /api/stats`

Retorna:

```json
{
  "success": true,
  "date": "2025-11-18",
  "sent": 25,
  "remaining": 425,
  "limit": 450,
  "percentage": 5
}
```

## 📝 Códigos de Erro

### `DAILY_LIMIT_REACHED` (429)

O limite diário de 450 emails foi atingido.

**Resposta:**

```json
{
  "success": false,
  "error": "DAILY_LIMIT_REACHED",
  "message": "Limite diário de 450 emails atingido...",
  "stats": {
    "sent": 450,
    "limit": 450,
    "remaining": 0
  }
}
```

### `INSUFFICIENT_QUOTA` (429)

Tentou enviar mais emails do que o disponível.

**Exemplo:** Restam 10 emails, mas tentou enviar 15.

**Resposta:**

```json
{
  "success": false,
  "error": "INSUFFICIENT_QUOTA",
  "message": "Você pode enviar 10 emails hoje, mas tentou enviar 15.",
  "stats": {
    "sent": 440,
    "limit": 450,
    "remaining": 10,
    "requested": 15
  }
}
```

## 🔍 Monitoramento

### Ver Estatísticas (Desenvolvimento)

```bash
curl http://localhost:3001/api/stats
```

### Ver no Console do Servidor

O servidor mostra automaticamente ao iniciar:

```
📊 Limite de emails: 0/450 (450 restantes)
```

E a cada email enviado:

```
📊 Email contador: 1/450 (restam 449)
```

## 🛠️ Funções Disponíveis

### `checkDailyLimit()`

Verifica o status do limite sem modificar o contador.

**Retorna:**

```javascript
{
  allowed: true,      // Se pode enviar
  remaining: 445,     // Quantos restam
  limit: 450,         // Limite total
  current: 5          // Quantos já foram enviados
}
```

### `incrementCounter()`

Incrementa o contador após envio bem-sucedido.

**Retorna:** `true` se incrementado, `false` se limite atingido

### `getStats()`

Obtém estatísticas completas.

**Retorna:**

```javascript
{
  date: "2025-11-18",
  sent: 5,
  remaining: 445,
  limit: 450,
  percentage: 1
}
```

### `resetCounter()` (apenas desenvolvimento)

Reseta manualmente o contador (útil para testes).

## ⚙️ Configuração

### Alterar o Limite

Edite o valor em ambos os arquivos:

**`server/emailCounter.js`:**

```javascript
const DAILY_LIMIT = 450; // Altere aqui
```

**`netlify/functions/emailCounter.js`:**

```javascript
const DAILY_LIMIT = 450; // Altere aqui
```

## 📌 Observações Importantes

1. **Reset Automático**: O contador reseta automaticamente à meia-noite (00:00)
2. **Timezone**: Usa UTC por padrão
3. **Persistência**: Em desenvolvimento, os dados são salvos em JSON
4. **Netlify**: Em produção serverless, o contador pode resetar entre deploys
5. **Gitignore**: O arquivo `email-counter.json` não é versionado

## 🔐 Segurança

- ✅ Arquivo de contador em `.gitignore`
- ✅ Validação antes de cada envio
- ✅ Não permite envios após limite
- ✅ Logs de segurança no console

## 🎓 Exemplo de Uso

```javascript
import { checkDailyLimit, incrementCounter } from "./emailCounter.js";

// Antes de enviar
const check = checkDailyLimit();
if (!check.allowed) {
  console.log(`Limite atingido! ${check.current}/${check.limit}`);
  return;
}

// Enviar email
await sendEmail(data);

// Incrementar contador
incrementCounter();
```

## 🐛 Troubleshooting

### Contador não reseta

Verifique a data do sistema e timezone.

### Contador mostra valores errados

Delete o arquivo `server/email-counter.json` e reinicie o servidor.

### Limite muito baixo

Altere `DAILY_LIMIT` nos arquivos de configuração.

## 📚 Referências

- [Gmail Sending Limits](https://support.google.com/mail/answer/22839)
- Limite gratuito Gmail: 500 emails/dia
- Limite implementado: 450 emails/dia (margem de segurança)
