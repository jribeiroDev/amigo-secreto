# 🚀 Deploy no Netlify com Contador de Emails

## ⚠️ IMPORTANTE: Configuração do Netlify Blobs

O sistema de contador de emails usa **Netlify Blobs** para persistência em produção.

## 📦 Pré-requisitos

1. Conta no Netlify (gratuita)
2. Netlify CLI instalado (opcional, mas recomendado)

## 🔧 Passo a Passo

### 1. Instalar Dependências das Functions

```bash
cd netlify/functions
npm install
```

Isso instalará:

- `nodemailer` - Para envio de emails
- `@netlify/blobs` - Para armazenamento persistente do contador

### 2. Configurar Variáveis de Ambiente no Netlify

No painel do Netlify:

1. Vá em **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

```
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app-do-gmail
```

### 3. Deploy

#### Opção A: Via Netlify CLI (Recomendado)

```bash
# Na raiz do projeto
netlify deploy --prod
```

#### Opção B: Via Git (GitHub/GitLab)

1. Conecte seu repositório ao Netlify
2. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 4. Verificar Blobs

O Netlify Blobs é **ativado automaticamente**. Para verificar:

1. Acesse o painel do Netlify
2. Vá em **Storage** → **Blobs**
3. Você verá o store `email-counter` após o primeiro email enviado

## 🔍 Como Funciona o Contador no Netlify

### Armazenamento Persistente

```
Netlify Blobs
└── email-counter (store)
    └── daily-counter (chave)
        {
          "date": "2025-11-18",
          "count": 25
        }
```

### Fluxo de Funcionamento

1. **Primeira invocação do dia**:

   - Lê o contador do Netlify Blobs
   - Se a data mudou, reseta para 0
   - Incrementa e salva de volta

2. **Invocações seguintes**:

   - Lê o contador atual
   - Verifica se está abaixo de 450
   - Incrementa e salva

3. **Múltiplas instâncias**:
   - Todas as instâncias compartilham o mesmo Blobs
   - Garantia de consistência

## 📊 Monitoramento

### Ver Estatísticas via API

```bash
# Substituir YOUR-SITE.netlify.app pelo seu domínio
curl https://YOUR-SITE.netlify.app/api/stats
```

### Ver no Painel do Netlify

1. **Functions** → **send-email** → **Function logs**
2. Você verá logs como:
   ```
   📊 Email contador: 25/450 (restam 425)
   ```

### Ver Dados no Blobs

```bash
# Via Netlify CLI
netlify blobs:list email-counter
netlify blobs:get email-counter daily-counter
```

## 🐛 Troubleshooting

### Erro: "Cannot find module '@netlify/blobs'"

**Solução:**

```bash
cd netlify/functions
npm install @netlify/blobs
netlify deploy --prod
```

### Contador não persiste entre deploys

**Verifique:**

1. Se `@netlify/blobs` está instalado em `netlify/functions/package.json`
2. Se o deploy incluiu a pasta `netlify/functions/node_modules`
3. Logs da função no painel do Netlify

### Erro: "Blobs not enabled"

**Solução:**
O Netlify Blobs é gratuito e deve estar ativo automaticamente. Se não:

1. Vá em **Site settings** → **Storage**
2. Ative **Blobs** se necessário

## 💰 Custos do Netlify Blobs

### Plano Gratuito (Pro Starter)

- ✅ **1 GB de armazenamento**
- ✅ **1 milhão de leituras/mês**
- ✅ **1 milhão de escritas/mês**

### Uso do Contador

- **Armazenamento**: ~100 bytes (1 registro JSON)
- **Por email enviado**: 1 leitura + 1 escrita
- **450 emails/dia**: 900 operações/dia = 27.000/mês

**Conclusão**: Muito abaixo dos limites gratuitos! ✅

## 🔐 Segurança

### Dados Armazenados

```json
{
  "date": "2025-11-18",
  "count": 25
}
```

- ✅ Sem informações pessoais
- ✅ Sem dados de participantes
- ✅ Apenas contagem diária

### Acesso

- ❌ Não é público
- ✅ Apenas suas functions podem acessar
- ✅ Isolado por site do Netlify

## 📝 Notas Importantes

1. **Reset Diário**: Automático à meia-noite UTC
2. **Timezone**: Por padrão usa UTC, mas pode ser customizado
3. **Limite**: 450 emails/dia (margem de segurança dos 500 do Gmail)
4. **Persistência**: Dados mantidos indefinidamente no Netlify Blobs
5. **Rollback**: Se fizer rollback de deploy, o contador persiste

## 🎯 Teste Local com Netlify Dev

Para testar localmente com Blobs:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Linkar com seu site (opcional)
netlify link

# Rodar dev server
netlify dev
```

Isso simulará o ambiente Netlify localmente, incluindo Blobs.

## 🔄 Resetar Contador (Emergência)

Se precisar resetar o contador manualmente:

```bash
# Via Netlify CLI
netlify blobs:delete email-counter daily-counter
```

Ou via código, adicione uma function temporária:

```javascript
import { getStore } from "@netlify/blobs";

export const handler = async () => {
  const store = getStore("email-counter");
  await store.setJSON("daily-counter", {
    date: new Date().toISOString().split("T")[0],
    count: 0,
  });
  return { statusCode: 200, body: "Reset!" };
};
```

## 📚 Referências

- [Netlify Blobs Documentation](https://docs.netlify.com/blobs/overview/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Gmail Sending Limits](https://support.google.com/mail/answer/22839)
