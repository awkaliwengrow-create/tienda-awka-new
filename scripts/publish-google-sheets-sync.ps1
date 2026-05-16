param(
    [string]$CommitMessage = "Sync catalog from Google Sheets"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$syncScript = Join-Path $PSScriptRoot "run-google-sheets-sync.ps1"
$auditScript = Join-Path $PSScriptRoot "run-catalog-audit.ps1"

if (-not (Test-Path $syncScript)) {
    Write-Error "No encontramos scripts\run-google-sheets-sync.ps1."
}

if (-not (Test-Path $auditScript)) {
    Write-Error "No encontramos scripts\run-catalog-audit.ps1."
}

Push-Location $repoRoot
try {
    Write-Host ""
    Write-Host "1) Sincronizando Google Sheets..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -File $syncScript

    Write-Host ""
    Write-Host "2) Auditando catalogo..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -File $auditScript

    Write-Host ""
    Write-Host "3) Estado antes de publicar:" -ForegroundColor Cyan
    git status --short

    Write-Host ""
    Write-Host "4) Publicando cambios..." -ForegroundColor Cyan
    git add js/products.js api/_lib/reward-catalog.generated.json data/product-metadata.json
    git commit -m $CommitMessage
    git push origin main

    Write-Host ""
    Write-Host "Publicacion completa." -ForegroundColor Green
    Write-Host ""
}
finally {
    Pop-Location
}
