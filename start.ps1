# Script para iniciar o projeto completo

Write-Host "🎁 Iniciando Amigo Secreto..." -ForegroundColor Cyan
Write-Host ""

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "server/node_modules")) {
    Write-Host "📦 Instalando dependências do servidor..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

# Verificar se o .env existe
if (-not (Test-Path "server/.env")) {
    Write-Host ""
    Write-Host "⚠️  ATENÇÃO: Arquivo server/.env não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "1. Copie server/.env.example para server/.env" -ForegroundColor White
    Write-Host "2. Edite server/.env com suas credenciais do Gmail" -ForegroundColor White
    Write-Host "3. Veja o guia: GMAIL_SMTP_SETUP.md" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione qualquer tecla para continuar mesmo assim..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green
Write-Host ""
Write-Host "📧 Backend (SMTP): http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend (React): http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para parar os servidores, pressione Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Iniciar backend em um novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm start"

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# Iniciar frontend no terminal atual
npm run dev
