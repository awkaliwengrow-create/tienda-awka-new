$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$auditScript = Join-Path $PSScriptRoot "audit-google-sheets-catalog.js"

if (-not (Test-Path $auditScript)) {
    Write-Error "No encontramos scripts\audit-google-sheets-catalog.js."
}

Write-Host ""
Write-Host "Auditando el catalogo generado..." -ForegroundColor Cyan
Write-Host ""

Push-Location $repoRoot
try {
    node $auditScript
    Write-Host ""
    Write-Host "Auditoria terminada." -ForegroundColor Green
    Write-Host "Si quieres el detalle, abre tmp\catalog-audit.json" -ForegroundColor Yellow
    Write-Host ""
}
finally {
    Pop-Location
}
