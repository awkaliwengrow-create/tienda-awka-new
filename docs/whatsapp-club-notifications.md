# WhatsApp para Club Awka

Esta capa deja listo el producto para avisar por WhatsApp cuando:

- una compra acredita puntos
- una compra desbloquea giros
- el admin habilita giros manualmente
- el admin acredita puntos manualmente

## Como funciona

1. El evento principal ocurre primero.
2. Puntos o giros se guardan normalmente.
3. Despues se intenta enviar WhatsApp.
4. Si WhatsApp falla, no se cae la compra ni el club.

## Variables de entorno

- `AWKA_WHATSAPP_NOTIFICATIONS_ENABLED=true`
- `AWKA_WHATSAPP_PROVIDER=meta_cloud`
- `AWKA_WHATSAPP_ACCESS_TOKEN=...`
- `AWKA_WHATSAPP_PHONE_NUMBER_ID=...`
- `AWKA_WHATSAPP_GRAPH_VERSION=v25.0`
- `AWKA_WHATSAPP_DEFAULT_COUNTRY_CODE=549`
- `AWKA_WHATSAPP_TEMPLATE_LANGUAGE=es_AR`
- `AWKA_WHATSAPP_TEMPLATE_POINTS=...`
- `AWKA_WHATSAPP_TEMPLATE_POINTS_AND_SPINS=...`
- `AWKA_WHATSAPP_TEMPLATE_SPINS=...`

## Datos actuales de Awka Liwen Club

La app de Meta creada para esta integracion es:

- `App name`: `Awka Liwen Club`
- `App ID`: `1338149921626220`
- `WhatsApp Business Account ID`: `1001712389498404`
- `Phone Number ID`: `1169903369544965`
- `Numero de prueba`: `+1 555 658 4596`

## Paso practico para dejarlo funcionando

En Vercel, dentro del proyecto, define:

- `AWKA_WHATSAPP_NOTIFICATIONS_ENABLED=true`
- `AWKA_WHATSAPP_PROVIDER=meta_cloud`
- `AWKA_WHATSAPP_ACCESS_TOKEN=<token temporal o productivo>`
- `AWKA_WHATSAPP_PHONE_NUMBER_ID=1169903369544965`
- `AWKA_WHATSAPP_GRAPH_VERSION=v25.0`
- `AWKA_WHATSAPP_DEFAULT_COUNTRY_CODE=549`

Si por ahora no usaras plantillas aprobadas, no hace falta definir:

- `AWKA_WHATSAPP_TEMPLATE_POINTS`
- `AWKA_WHATSAPP_TEMPLATE_POINTS_AND_SPINS`
- `AWKA_WHATSAPP_TEMPLATE_SPINS`

## Nota sobre el token

- El token generado desde Meta en este flujo es temporal y sirve para pruebas.
- Para produccion conviene reemplazarlo por un token mas estable del sistema que uses finalmente.

## Prueba rapida local

Si quieres validar la integracion sin tocar compras reales, puedes correr:

```bash
node scripts/test-whatsapp-notification.js --phone 2494009164 --name Joaquin --type manual_points_credit --points 3
```

El script usa la misma capa del club y responde con:

- `ok: true` si el envio salio
- `skipped: true` si faltan variables o esta desactivado
- `reason: ...` si Meta rechazo el envio

## Proveedor asumido

La implementacion actual asume `WhatsApp Cloud API` de Meta.

## Nota importante sobre numeros argentinos

Meta puede registrar destinatarios de prueba de Argentina con distintos formatos internos.

Para evitar rechazos como `Account not registered`, la capa ahora intenta automaticamente:

- `549` + numero normalizado
- `54` + numero normalizado
- y variantes `54 + codigo de area + 15 + numero local`

Con esto no necesitas cambiar la carga del cliente en el club ni tocar el script de prueba.

## Texto libre vs plantillas

La capa puede enviar:

- texto libre, si solo quieres una base simple
- o plantillas aprobadas, si quieres una version mas profesional para mensajes salientes

Si defines plantillas:

- `AWKA_WHATSAPP_TEMPLATE_POINTS`
- `AWKA_WHATSAPP_TEMPLATE_POINTS_AND_SPINS`
- `AWKA_WHATSAPP_TEMPLATE_SPINS`

el sistema las usa primero.

## Tabla opcional

Si quieres auditar envios en Supabase, crea la tabla:

- `club_whatsapp_notifications`

La app no depende de esa tabla para funcionar, pero si existe:

- guarda si el mensaje salio
- registra si fallo
- deja trazabilidad por telefono y fecha

## Tipos de mensajes

### Compra con puntos

Ejemplo:

`Hola Joaquin, tu compra en Awka ya sumo 5 puntos en Club Awka.`

### Compra con puntos y giros

Ejemplo:

`Hola Joaquin, tu compra en Awka ya sumo 5 puntos y activo 2 giros en Awka Play.`

### Giro manual desde admin

Ejemplo:

`Hola Joaquin, te habilitamos 1 giro en Awka Play.`

### Acreditacion manual de puntos

Ejemplo:

`Hola Joaquin, te acreditamos 3 puntos en Club Awka.`

## Estado visible en Admin

Cuando el admin habilita un giro o acredita puntos, el panel muestra:

- `WhatsApp enviado`
- o un aviso de que fallo o aun no esta configurado
