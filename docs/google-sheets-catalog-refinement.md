# Refinar Catalogo desde Google Sheets

Este paso sirve para mantener el catalogo limpio antes de publicar cambios.

## Flujo recomendado

1. cambias `WEB_CATALOGO` o `WEB_CANJES`
2. corres la sync
3. corres la auditoria del catalogo
4. si el resultado se ve bien, publicas

## Comandos

### Sync

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-google-sheets-sync.ps1
```

### Auditoria

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-catalog-audit.ps1
```

## Que revisa la auditoria

- productos sin imagen
- productos sin descripcion
- texto con caracteres raros (`Ã`, `Â`, `�`)
- variantes sin precio
- IDs duplicados
- variantes duplicadas

## Donde ver el detalle

La auditoria deja un reporte en:

`tmp/catalog-audit.json`

## Cuando vale la pena correrla

- cuando cargaste una tanda grande de productos
- cuando cambiaste muchos nombres
- cuando retocaste imagenes o descripciones
- antes de una publicacion importante
