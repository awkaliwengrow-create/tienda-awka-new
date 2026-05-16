$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $PSScriptRoot "google-sheets-sync.config.json"
$syncScript = Join-Path $PSScriptRoot "sync-google-sheets.js"

if (-not (Test-Path $configPath)) {
    Write-Error "No encontramos scripts\google-sheets-sync.config.json. Revisa que exista tu config local."
}

if (-not (Test-Path $syncScript)) {
    Write-Error "No encontramos scripts\sync-google-sheets.js."
}

Write-Host ""
Write-Host "Sincronizando catalogo y canjes desde Google Sheets..." -ForegroundColor Cyan
Write-Host ""

Push-Location $repoRoot
try {
    node $syncScript --config $configPath --write-products --write-rewards

    Write-Host ""
    Write-Host "Sync terminada." -ForegroundColor Green
    Write-Host "Revisa cambios con: git status --short" -ForegroundColor Yellow
    Write-Host "Si todo se ve bien, publica con:" -ForegroundColor Yellow
    Write-Host "  git add js/products.js api/_lib/reward-catalog.generated.json scripts/sync-google-sheets.js data/product-metadata.json" -ForegroundColor Yellow
    Write-Host "  git commit -m ""Sync catalog from Google Sheets""" -ForegroundColor Yellow
    Write-Host "  git push origin main" -ForegroundColor Yellow
    Write-Host ""
}
finally {
    Pop-Location
}
