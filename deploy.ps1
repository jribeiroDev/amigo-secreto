# PowerShell script for deploying to Netlify

Write-Host "🚀 Preparando deploy para Netlify..." -ForegroundColor Cyan

# 1. Build do frontend
Write-Host "📦 Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do frontend" -ForegroundColor Red
    exit 1
}

# 2. Instalar dependências das functions
Write-Host "📦 Instalando dependências das functions..." -ForegroundColor Yellow
Set-Location netlify/functions
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

Set-Location ../..

# 3. Verificar git
Write-Host "📝 Verificando git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "⚠️  Existem mudanças não commitadas:" -ForegroundColor Yellow
    Write-Host $gitStatus
    Write-Host ""
    $commit = Read-Host "Deseja commitar as dependências agora? (y/n)"
    
    if ($commit -eq 'y' -or $commit -eq 'Y') {
        git add netlify/functions/package*.json
        git add netlify/functions/node_modules
        git commit -m "chore: update functions dependencies"
        Write-Host "✅ Mudanças commitadas" -ForegroundColor Green
    }
}

# 4. Deploy
Write-Host "🚀 Fazendo deploy no Netlify..." -ForegroundColor Cyan
netlify deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no deploy" -ForegroundColor Red
    exit 1
}
