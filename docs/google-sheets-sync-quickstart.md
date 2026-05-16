# Google Sheets Sync - Uso Rapido

Este flujo sirve para actualizar el catalogo y los canjes desde tus hojas de Google Sheets sin tocar el codigo a mano.

## Antes de correr la sync

Revisa solo estas dos hojas:

- `WEB_CATALOGO`
- `WEB_CANJES`

Regla practica:

- si cambias `PRECIO`, impacta en la web despues de sincronizar y publicar
- si cambias `STOCK`, impacta en la web despues de sincronizar y publicar
- si un producto esta activo y tiene stock mayor a `0`, la sync lo deja visible

## Como correr la sync

Desde la carpeta del proyecto, ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-google-sheets-sync.ps1
```

Eso actualiza:

- `js/products.js`
- `api/_lib/reward-catalog.generated.json`

Opcional, para revisar el catalogo antes de publicar:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-catalog-audit.ps1
```

## Como publicar

Despues de correr la sync:

```powershell
git status --short
git add js/products.js api/_lib/reward-catalog.generated.json scripts/sync-google-sheets.js data/product-metadata.json
git commit -m "Sync catalog from Google Sheets"
git push origin main
```

## Que pasa si cambias un precio o stock y no lo ves en la web

Eso significa una de estas dos cosas:

1. aun no corriste la sync
2. corriste la sync pero aun no publicaste

La hoja sola no actualiza la web en vivo.

## Nota sobre imagenes

Las imagenes y descripciones se preservan desde `data/product-metadata.json`.

Eso permite que el catalogo tome:

- precios y stock desde Google Sheets
- imagenes y copy desde la base visual ya armada
