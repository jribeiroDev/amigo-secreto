# 🎁 Amigo Secreto

Aplicação moderna e simples para sorteio de Amigo Secreto com envio automático de emails via Gmail SMTP.

## 🚀 Features

- ✅ Sorteio automático sem repetições
- ✅ Envio de emails automático via Gmail SMTP
- ✅ Interface moderna e responsiva
- ✅ Sistema de retry (3 tentativas por email)
- ✅ Modo debug para desenvolvimento
- ✅ Pronto para deploy no Netlify

## 🛠️ Tecnologias

- **Frontend**: React + Vite
- **Backend Local**: Node.js + Express + Nodemailer
- **Backend Produção**: Netlify Functions
- **Email**: Gmail SMTP

## 📦 Instalação

### Desenvolvimento Local

```bash
# Clone o repositório
git clone <seu-repo>
cd amigo-secreto

# Instale dependências do frontend
npm install

# Instale dependências do backend
npm run server:install

# Configure variáveis de ambiente
cd server
cp .env.example .env
# Edite .env com suas credenciais do Gmail
```

### Configurar Gmail

1. Acesse: https://myaccount.google.com/security
2. Ative verificação em duas etapas
3. Crie uma senha de app:

   - Vá em "Senhas de app"
   - Selecione "App personalizado" → "Amigo Secreto"
   - Copie a senha gerada

4. Edite `server/.env`:

```env
GMAIL_USER=seu-email@gmail.com
GMAIL_APP_PASSWORD=sua-senha-de-app-16-digitos
```

## 🏃 Executar

### Desenvolvimento

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server

# Acesse: http://localhost:5173
```

### Modo Debug

```bash
# Crie .env na raiz
echo "VITE_DEBUG=true" > .env

# Execute normalmente
npm run dev
```

Veja logs detalhados no console do navegador.

## 🌐 Deploy no Netlify

Veja guia completo em [NETLIFY_SETUP.md](./NETLIFY_SETUP.md)

**Resumo rápido**:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify init
netlify deploy --prod
```

**Configurar no Netlify Dashboard**:

- Environment Variables:
  - `GMAIL_USER=seu-email@gmail.com`
  - `GMAIL_APP_PASSWORD=sua-senha-de-app`

## 📖 Guias

- [GMAIL_SMTP_SETUP.md](./GMAIL_SMTP_SETUP.md) - Configuração Gmail SMTP
- [NETLIFY_SETUP.md](./NETLIFY_SETUP.md) - Deploy no Netlify
- [QUICK_START_SMTP.md](./QUICK_START_SMTP.md) - Início rápido

## 🎯 Como Usar

1. **Preencha dados do evento**:

   - Nome do evento
   - Valor sugerido (€)
   - Data (opcional)

2. **Adicione participantes**:

   - Nome e Email são obrigatórios
   - Mínimo 3 participantes

3. **Realizar sorteio**:

   - Clique em "Realizar Sorteio"
   - Algoritmo garante que ninguém tira a si mesmo

4. **Enviar emails**:
   - Clique em "Enviar Emails"
   - Emails são enviados automaticamente
   - Sistema tenta 3x em caso de falha

## 🔧 Scripts Disponíveis

```bash
npm run dev              # Frontend dev server
npm run build           # Build para produção
npm run preview         # Preview do build
npm run server          # Backend local
npm run server:install  # Instalar deps do backend
npm run netlify:dev     # Testar com Netlify localmente
npm run netlify:deploy  # Deploy no Netlify
```

## 📁 Estrutura

```
amigo-secreto/
├── src/
│   ├── components/      # Componentes React
│   ├── services/        # Email service (SMTP)
│   ├── utils/           # Algoritmo de sorteio
│   └── App.jsx
├── server/              # Backend local (Node.js)
├── netlify/
│   └── functions/       # Serverless functions
├── netlify.toml         # Config Netlify
└── package.json
```

## 🐛 Troubleshooting

**Emails não enviam localmente**:

- Verifique se o servidor backend está rodando (`npm run server`)
- Confirme credenciais no `server/.env`
- Verifique senha de app do Gmail

**Build falha no Netlify**:

- Certifique-se que `netlify.toml` está na raiz
- Verifique variáveis de ambiente no Netlify

**Erro "Failed to fetch"**:

- Em dev: Servidor backend não está rodando
- Em prod: Variáveis de ambiente não configuradas no Netlify

## 🚀 Início Rápido

### Gmail SMTP (Recomendado)

```bash
# 1. Instalar dependências
npm install
npm run server:install

# 2. Configurar Gmail (criar senha de app)
cd server
cp .env.example .env
# Edite .env com suas credenciais

# 3. Iniciar backend (Terminal 1)
npm run server

# 4. Iniciar frontend (Terminal 2)
npm run dev
```

**📖 Guia completo:** Veja [GMAIL_SMTP_SETUP.md](./GMAIL_SMTP_SETUP.md) ou [QUICK_START_SMTP.md](./QUICK_START_SMTP.md)

## 📱 Como Funciona

### Fluxo de Uso:

1. **Preencher Informações do Evento**

   - Nome do evento
   - Valor sugerido do presente
   - Data do evento

2. **Adicionar Participantes**

   - Nome completo
   - Email (obrigatório)
   - Mínimo 3 participantes

3. **Realizar Sorteio**

   - Clique em "Realizar Sorteio"
   - O algoritmo garante que ninguém tira a si mesmo

4. **Enviar Notificações**
   - Envia automaticamente emails para todos os participantes

## 🛠️ Tecnologias Utilizadas

- **React** - Biblioteca para construção da interface
- **Vite** - Build tool e dev server
- **Node.js + Express** - Backend para envio de emails
- **Nodemailer** - Biblioteca para envio de emails via SMTP
- **Gmail SMTP** - Serviço de email

## 📂 Estrutura do Projeto

```
amigo-secreto/
├── src/
│   ├── components/
│   │   ├── EventInfo.jsx          # Formulário de informações do evento
│   │   ├── EventInfo.css
│   │   ├── ParticipantsList.jsx   # Lista e gerenciamento de participantes
│   │   └── ParticipantsList.css
│   ├── services/
│   │   └── emailService.js        # Integração com SMTP
│   ├── utils/
│   │   └── secretSanta.js         # Algoritmo de sorteio
│   ├── App.jsx                    # Componente principal
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── server/                        # Backend Node.js
│   ├── server.js                  # Servidor Express + Nodemailer
│   ├── package.json
│   └── .env.example
├── netlify/
│   └── functions/
│       └── send-email.js         # Netlify Function
├── package.json
└── README.md
```

## 🎨 Personalização

### Cores e Temas

Edite o arquivo `src/App.css` para personalizar:

- Gradiente de fundo
- Cores dos botões
- Espaçamentos
- Responsividade

## 🔒 Segurança e Privacidade

- ⚠️ O sorteio acontece no navegador do cliente
- ⚠️ Nenhum dado é armazenado em servidor
- ⚠️ Os dados são perdidos ao recarregar a página
- ⚠️ Não compartilhe suas credenciais do Gmail
- ⚠️ Use senha de app do Gmail (não a senha da conta)

## 📝 Limitações

### Gmail SMTP (Plano Gratuito):

- 500 emails por dia
- Limite de taxa configurável no código

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 🎯 Próximas Melhorias

- [ ] Persistência de dados (LocalStorage)
- [ ] Exportar lista de participantes
- [ ] Histórico de sorteios
- [ ] Temas customizáveis
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)

---

Desenvolvido com ❤️ para facilitar seus sorteios de Amigo Secreto!
