#!/bin/bash

echo "🚀 Preparando deploy para Netlify..."

# 1. Build do frontend
echo "📦 Building frontend..."
npm run build

# 2. Instalar dependências das functions
echo "📦 Instalando dependências das functions..."
cd netlify/functions
npm install
cd ../..

# 3. Commit (se necessário)
echo "📝 Verificando git..."
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Existem mudanças não commitadas"
  echo "💡 Commit as mudanças antes de fazer deploy"
  read -p "Deseja commitar agora? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add netlify/functions/package*.json
    git add netlify/functions/node_modules
    git commit -m "chore: update functions dependencies"
  fi
fi

# 4. Deploy
echo "🚀 Fazendo deploy..."
netlify deploy --prod

echo "✅ Deploy concluído!"
