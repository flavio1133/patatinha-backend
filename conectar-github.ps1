# Conectar este projeto ao GitHub e fazer o primeiro push
# Uso: .\conectar-github.ps1
# Ou:  .\conectar-github.ps1 -RepoUrl "https://github.com/SEU_USUARIO/patatinha-petshop.git"

param(
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"

if (-not $RepoUrl) {
    Write-Host "Digite a URL do repositorio GitHub (ex: https://github.com/seu-usuario/patatinha-petshop.git):" -ForegroundColor Cyan
    $RepoUrl = Read-Host
}

if (-not $RepoUrl.Trim()) {
    Write-Host "URL vazia. Saindo." -ForegroundColor Red
    exit 1
}

$RepoUrl = $RepoUrl.Trim()
if (-not $RepoUrl.EndsWith(".git")) { $RepoUrl = $RepoUrl + ".git" }

Write-Host "`nConectando a: $RepoUrl" -ForegroundColor Yellow
Write-Host "Certifique-se de que o repositorio ja foi criado em https://github.com/new (pode ser vazio)`n" -ForegroundColor Gray

git remote add origin $RepoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin $RepoUrl
}

Write-Host "Enviando codigo para GitHub (branch main)..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPronto. Proximo passo:" -ForegroundColor Green
    Write-Host "1. Abra o Render (dashboard.render.com)" -ForegroundColor White
    Write-Host "2. No seu Web Service da API, em Settings -> Build & Deploy" -ForegroundColor White
    Write-Host "3. Conecte ao repositorio que voce acabou de usar (ou atualize o branch para main)" -ForegroundColor White
    Write-Host "4. Clique em Manual Deploy -> Deploy latest commit" -ForegroundColor White
    Write-Host "`nAssim o backend em producao ficara com o codigo novo." -ForegroundColor Gray
} else {
    Write-Host "`nErro no push. Verifique:" -ForegroundColor Red
    Write-Host "- O repositorio existe no GitHub" -ForegroundColor White
    Write-Host "- Voce tem permissao (fez login: git config user.name / user.email)" -ForegroundColor White
    Write-Host "- Se usa HTTPS, pode ser necessario informar usuario/senha ou token" -ForegroundColor White
    exit 1
}
