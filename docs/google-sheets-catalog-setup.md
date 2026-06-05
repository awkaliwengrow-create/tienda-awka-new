# Google Sheets para Awka Liwen

Objetivo: usar **un solo archivo de Google Sheets** con hojas separadas para operar el negocio y alimentar la web sin romper la lista principal.

## Estructura recomendada

Usa el mismo archivo y separa asi:

1. `LISTA_MAESTRA`
- tu hoja operativa real
- costos
- stock
- margenes
- precios internos

2. `WEB_CATALOGO`
- hoja limpia pensada para el sitio
- solo columnas publicas o utiles para renderizar productos

3. `WEB_CANJES`
- hoja limpia para productos canjeables por puntos

## 1. LISTA_MAESTRA

Deja aqui tu operacion completa.

Si la fuente viene de una hoja como `Lista Prod` de tu archivo `LISTA_PRODUCTOS mayo2026.xlsx`, esta bien mantenerla asi.

Nota importante:
- esa version trae portada y resumen arriba
- los encabezados reales del inventario arrancan en la fila `5`
- el puente `scripts/sync-google-sheets.js` ya fue ajustado para detectar automaticamente esa fila de encabezados

Columnas sugeridas:
- `SKU`
- `LINEA`
- `SUBCATEGORIA`
- `PRODUCTO`
- `COSTO`
- `CANTIDAD`
- `STOCK_VALUE`
- `MARKUP`
- `PRECIO_EFECTIVO`
- `PRECIO_DEBITO`
- `PRECIO_MAYORISTA`
- `OBSERVACIONES`

Esta hoja no deberia ser consumida directo por la web.

## 2. WEB_CATALOGO

Esta hoja deberia ser la fuente publica del sitio.

Columnas sugeridas:
- `SKU`
- `ACTIVO`
- `MOSTRAR_WEB`
- `DESTACADO`
- `PRODUCT_ID_WEB`
- `CATEGORIA_WEB`
- `MARCA`
- `NOMBRE`
- `SIZE_LABEL`
- `DESCRIPCION_CORTA`
- `PRECIO`
- `PRECIO_DEBITO`
- `PRECIO_MAYORISTA`
- `STOCK`
- `SIN_STOCK`
- `IMAGEN`
- `ORDEN`

### Valores recomendados
- `ACTIVO`: `SI` / `NO`
- `MOSTRAR_WEB`: `SI` / `NO`
- `DESTACADO`: `SI` / `NO`
- `SIN_STOCK`: `SI` / `NO`

### Nota importante

`WEB_CATALOGO` conviene manejarla **una fila por variante**.

Ejemplo:
- `Tree Mix N | 45ml | 4900`
- `Tree Mix N | 200ml | 10500`

Despues el script agrupa esas filas y arma el `products.js` con `sizes`.

### CATEGORIA_WEB

Conviene normalizar nombres para que luego sea facil mapear al sitio:
- `fertilizantes`
- `plaguicidas`
- `herramientas`
- `macetas`
- `parafernalia`
- `papeles`
- `filtros`

## 3. WEB_CANJES

Esta hoja deberia manejar solo el catalogo de recompensas.

Columnas sugeridas:
- `ACTIVO`
- `REWARD_KEY`
- `SKU`
- `PRODUCT_ID_WEB`
- `NOMBRE`
- `MARCA`
- `SIZE_LABEL`
- `PUNTOS_CANJE`
- `PRECIO_REFERENCIA`
- `IMAGEN`
- `DESTACADO`
- `ORDEN`

### Valores recomendados
- `ACTIVO`: `SI` / `NO`
- `DESTACADO`: `SI` / `NO`

### Regla recomendada para canjes

- `1 punto se gana cada $5000 de compra`
- `1 punto de canje vale $500 de referencia`

Formula sugerida para `PUNTOS_CANJE`:

```gs
=MAX(1,ROUNDUP(I2/500,0))
```

Si `I2` fuera tu `PRECIO_REFERENCIA`.

La idea es separar:
- `acumulacion`: mas lenta, para sostener valor del programa
- `canje`: mas accesible, pero siempre atado al precio real del producto

## Logica recomendada

- `LISTA_MAESTRA` manda sobre negocio
- `WEB_CATALOGO` manda sobre tienda
- `WEB_CANJES` manda sobre recompensas

No mezclar todo en una sola hoja visible para la web.

## Ventajas de este esquema

- no rompes tu hoja principal
- separas datos internos de datos publicos
- puedes ocultar productos sin tocar costos o margenes
- puedes elegir canjes sin ensuciar el catalogo general
- luego es mas facil automatizar

## Siguiente paso tecnico recomendado

Cuando esta estructura exista en Drive:

1. leer `WEB_CATALOGO`
2. generar datos del catalogo del sitio
3. leer `WEB_CANJES`
4. generar recompensas del club

Primero manual o semi-automatico.
Despues, si quieres, automatizado.

## Mapeo desde tu lista actual

Segun tu hoja actual `Lista Prod`, hoy ya tienes estas columnas base:

- `LINEA`
- `SUB-CATEGORIA`
- `PRODUCTO`
- `$ COSTO`
- `CANTIDAD`
- `STOCK VALUE`
- `MARKUP %`
- `P. EFECTIVO`
- `P. DEBITO`
- `P. MAYORISTA`

La forma mas segura es:
- `Lista Prod` sigue como hoja operativa
- `WEB_CATALOGO` toma una version limpia
- `WEB_CANJES` toma solo productos elegidos para puntos

## Mapeo recomendado a WEB_CATALOGO

### Columnas de destino

- `SKU`
  - si no existe hoy, crear uno
  - puede ser manual
  - ejemplo: `TMIX-N-45`

- `ACTIVO`
  - manual
  - `SI` si el producto sigue vigente
  - `NO` si no quieres usarlo mas

- `MOSTRAR_WEB`
  - manual
  - `SI` si quieres publicarlo
  - `NO` si quieres mantenerlo interno

- `DESTACADO`
  - manual
  - `SI` / `NO`

- `PRODUCT_ID_WEB`
  - obligatorio para sincronizar con la web actual
  - debe ser unico por producto agrupado

- `CATEGORIA_WEB`
  - sale de `SUB-CATEGORIA` o de una decision manual
  - debe quedar normalizada a las categorias del sitio

- `MARCA`
  - sale de `LINEA`

- `NOMBRE`
  - sale de `PRODUCTO`

- `SIZE_LABEL`
  - manual o copiado desde la presentacion
  - ejemplo: `45ml`, `200ml`, `X200`

- `DESCRIPCION_CORTA`
  - manual
  - una frase corta para web

- `PRECIO`
  - usar `P. EFECTIVO` como base publica inicial

- `PRECIO_DEBITO`
  - sale de `P. DEBITO`

- `PRECIO_MAYORISTA`
  - sale de `P. MAYORISTA`

- `STOCK`
  - sale de `CANTIDAD`

- `SIN_STOCK`
  - formula o manual
  - `SI` si `CANTIDAD = 0`
  - `NO` si `CANTIDAD > 0`

- `IMAGEN`
  - manual
  - ruta o nombre de archivo

- `ORDEN`
  - manual
  - numero para ordenar visualmente

## Formula sugerida para SIN_STOCK

Si `STOCK` esta en columna `K`:

```gs
=IF(K2<=0,"SI","NO")
```

## Formula sugerida para MOSTRAR_WEB

Si quieres ocultar automaticamente lo que no tiene stock:

```gs
=IF(AND(B2="SI",K2>0),"SI","NO")
```

Pero recomiendo que `MOSTRAR_WEB` quede manual al principio.

## Mapeo recomendado a WEB_CANJES

No usar todos los productos.
Solo una seleccion chica y controlada.

Columnas:

- `ACTIVO`
  - manual

- `REWARD_KEY`
  - unico
  - ejemplo: `treemix-n-45`

- `SKU`
  - copiar desde `WEB_CATALOGO`

- `PRODUCT_ID_WEB`
  - cuando luego conectemos la hoja con la web, este dato servira para mapear el producto

- `NOMBRE`
  - copiar desde `WEB_CATALOGO`

- `MARCA`
  - copiar desde `WEB_CATALOGO`

- `SIZE_LABEL`
  - manual si manejas variantes
  - ejemplo: `45ml`

- `PUNTOS_CANJE`
  - manual
  - segun tu estrategia

- `IMAGEN`
  - copiar desde `WEB_CATALOGO`

- `DESTACADO`
  - manual

- `ORDEN`
  - manual

## Reglas recomendadas para no romper nada

1. no reemplazar `Lista Prod`
2. no borrar columnas actuales
3. crear `WEB_CATALOGO` como hoja nueva
4. empezar con pocos productos
5. validar primero:
   - 10 a 20 productos
   - 3 a 5 canjes
6. despues escalar

## Orden practico para vos

1. dejar `Lista Prod` como esta
2. crear `WEB_CATALOGO`
3. copiar solo los productos que quieras publicar primero
4. crear `WEB_CANJES`
5. elegir solo recompensas accesibles
6. recien despues conectar la web

## Recomendacion final

No migres los 465 productos de una vez.

Empieza con:
- productos mas vendidos
- productos destacados
- productos con stock real
- recompensas faciles de entregar

Eso reduce errores y hace mucho mas facil adaptar la web sin romper tu operacion.

## Puente tecnico ya preparado

Quedo armado un flujo semi-automatico en:

- [C:\Users\User\OneDrive\Documentos\New project\awka-liwen-sitio-completo\awka-liwen-sitio\scripts\sync-google-sheets.js](C:\Users\User\OneDrive\Documentos\New%20project\awka-liwen-sitio-completo\awka-liwen-sitio\scripts\sync-google-sheets.js)
- [C:\Users\User\OneDrive\Documentos\New project\awka-liwen-sitio-completo\awka-liwen-sitio\scripts\google-sheets-sync.example.json](C:\Users\User\OneDrive\Documentos\New%20project\awka-liwen-sitio-completo\awka-liwen-sitio\scripts\google-sheets-sync.example.json)

### Que hace

1. lee `WEB_CATALOGO` y `WEB_CANJES` desde CSV o URLs de export de Google Sheets
2. genera snapshots en `tmp/`
3. puede generar un `products.js` nuevo
4. puede generar un `reward-catalog.generated.json` para canjes del club

### Uso recomendado

1. duplicar `google-sheets-sync.example.json`
2. renombrarlo a `google-sheets-sync.config.json`
3. pegar las URLs CSV export de tus hojas
4. correr:

```bash
node scripts/sync-google-sheets.js --config scripts/google-sheets-sync.config.json
```

### Si quieres aplicar al sitio

Para actualizar `products.js`:

```bash
node scripts/sync-google-sheets.js --config scripts/google-sheets-sync.config.json --write-products
```

Para actualizar recompensas del club:

```bash
node scripts/sync-google-sheets.js --config scripts/google-sheets-sync.config.json --write-rewards
```

Para actualizar ambos:

```bash
node scripts/sync-google-sheets.js --config scripts/google-sheets-sync.config.json --write-products --write-rewards
```

### Importante

Este puente no rompe el sitio actual.

- si no lo usas, todo sigue igual
- si lo usas, empiezas a mover precios y canjes desde Google Sheets
- usa primero snapshots y pruebas chicas
- no reemplaces `js/products.js` publicado hasta que `WEB_CATALOGO` tenga una base mas completa que una prueba inicial
