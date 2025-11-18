# NETLIFY_SETUP.md

## 🚀 Deploy no Netlify

### Configuração Rápida

1. **Configure as variáveis de ambiente no Netlify**:

   - Acesse: Site Settings → Environment Variables
   - Adicione:
     ```
     GMAIL_USER=seu-email@gmail.com
     GMAIL_APP_PASSWORD=sua-senha-de-app-do-gmail
     ```

2. **Build settings**:

   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Deploy**:

   ```bash
   # Via Git (recomendado)
   git init
   git add .
   git commit -m "Initial commit"
   # Conecte ao GitHub e importe no Netlify

   # Ou via Netlify CLI
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

### Criar Senha de App no Gmail

1. Acesse: https://myaccount.google.com/security
2. Ative a verificação em duas etapas
3. Vá em "Senhas de app"
4. Selecione "App personalizado" → Digite "Amigo Secreto"
5. Copie a senha gerada (16 caracteres sem espaços)

### Estrutura de Arquivos

```
amigo-secreto/
├── netlify/
│   └── functions/
│       ├── send-email.js       # Serverless function
│       └── package.json        # Dependências da função
├── netlify.toml                # Configuração do Netlify
├── dist/                       # Build files (gerado)
└── src/                        # Source code
```

### Testar Localmente

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Criar arquivo .env na raiz
echo "GMAIL_USER=seu-email@gmail.com" > .env
echo "GMAIL_APP_PASSWORD=sua-senha" >> .env

# Rodar localmente
netlify dev

# Acesse http://localhost:8888
```

### Verificar Deploy

1. Após o deploy, acesse seu site
2. Teste o sorteio com alguns participantes
3. Verifique os logs no Netlify: Functions → Logs

### Troubleshooting

**Erro: "Failed to fetch"**

- Verifique se as variáveis de ambiente estão configuradas no Netlify
- Confira os logs da função em Functions → Logs

**Emails não chegam**

- Confirme que a senha de app do Gmail está correta
- Verifique se a verificação em 2 etapas está ativa
- Cheque a pasta de spam

**Build falha**

- Certifique-se que `netlify.toml` está na raiz
- Verifique se todas as dependências estão no `package.json`
