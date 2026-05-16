# Publicar cambios desde Google Sheets

Si ya cambiaste `WEB_CATALOGO` o `WEB_CANJES`, tienes dos caminos.

## Camino corto

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-google-sheets-sync.ps1
```

Ese comando hace todo:

1. sincroniza
2. audita
3. prepara git
4. crea commit
5. hace push a `main`

## Camino paso a paso

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-google-sheets-sync.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\run-catalog-audit.ps1
git add js/products.js api/_lib/reward-catalog.generated.json data/product-metadata.json
git commit -m "Sync catalog from Google Sheets"
git push origin main
```

## Recomendacion

Para uso normal:

- usa `publish-google-sheets-sync.ps1`

Para revisar algo puntual antes de publicar:

- usa `run-google-sheets-sync.ps1`
- usa `run-catalog-audit.ps1`
- y despues publica a mano
