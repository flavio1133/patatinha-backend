# Deploy do frontend (build + Firebase)
# Execute na raiz do projeto: .\deploy-frontend.ps1

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
if (-not $projectRoot) { $projectRoot = Get-Location }

Write-Host "=== Build do frontend ===" -ForegroundColor Cyan
Set-Location (Join-Path $projectRoot "web")
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no build." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Deploy no Firebase ===" -ForegroundColor Cyan
Set-Location $projectRoot
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro no deploy Firebase." -ForegroundColor Red
    exit 1
}

Write-Host "`nDeploy do frontend concluido: https://patatinha-petshop.web.app" -ForegroundColor Green
Write-Host "Lembrete: o backend no Render so atualiza quando voce faz push para o GitHub e o Render faz o deploy." -ForegroundColor Yellow
