# Guia operativa de Awka Admin

## Objetivo

Esta guia resume como operar el ecosistema activo de Awka:

- tienda
- Club Awka
- Awka Play
- Awka Admin

La idea es que el flujo diario sea claro, repetible y facil de corregir si aparece un caso manual.

## URLs principales

- Sitio y catalogo: `https://tienda-awka-new.vercel.app/`
- Club Awka: `https://tienda-awka-new.vercel.app/club.html`
- Awka Play: `https://tienda-awka-new.vercel.app/ruleta.html`
- Awka Admin: `https://tienda-awka-new.vercel.app/admin.html`

## Flujo general del cliente

1. El cliente compra en la tienda.
2. La compra aprobada puede acreditar puntos.
3. El cliente entra a Club Awka con WhatsApp + PIN.
4. Ve su nivel, puntos, historial y giros.
5. Si tiene giros pendientes, entra a la ruleta.
6. Si gana un premio, queda registrado.
7. Desde admin se puede marcar el premio como entregado.

## Login del cliente

### Cliente nuevo

1. Entrar a `Club Awka`.
2. Cargar WhatsApp.
3. Crear nombre + PIN de 4 digitos.
4. Ingresar al panel.

### Cliente existente

1. Entrar a `Club Awka`.
2. Cargar WhatsApp.
3. Ingresar PIN.
4. Ver su panel.

## Que ve el cliente en Club Awka

- puntos activos
- puntos canjeados
- giros pendientes
- premios / giros
- nivel actual
- progreso al siguiente nivel
- historial reciente

## Cuando usar Awka Admin

Usar `Awka Admin` para estas tareas:

- habilitar giros manualmente
- ajustar puntos manualmente
- revisar premios pendientes
- marcar premios como entregados

## Habilitar giros manualmente

Caso de uso:

- premio por compra especial
- compensacion por error
- activacion promocional

Pasos:

1. Entrar a `Awka Admin`.
2. Ir al bloque `Habilitar giros`.
3. Cargar `Nombre`.
4. Cargar `WhatsApp`.
5. Elegir `Cantidad`.
6. Tocar `Habilitar giro`.

Resultado esperado:

- el cliente pasa a tener giros pendientes
- en `Club Awka` aparece el acceso a la ruleta

## Ajustar puntos manualmente

Caso de uso:

- sumar puntos por accion especial
- corregir saldo
- descontar puntos cargados por error

Pasos:

1. Entrar a `Awka Admin`.
2. Ir al bloque `Ajustar saldo`.
3. Cargar `Nombre`.
4. Cargar `WhatsApp`.
5. En `Ajuste`, poner:
   - positivo para sumar
   - negativo para restar
6. Tocar `Aplicar ajuste`.

Ejemplos:

- `5` suma cinco puntos
- `-3` resta tres puntos

Resultado esperado:

- el nuevo saldo se refleja en admin
- luego aparece actualizado en `Club Awka`

## Premios pendientes

Cuando un cliente gana un premio en la ruleta:

- se registra en `ruleta_registros`
- si corresponde entrega real, tambien aparece en `club_premios_estado`
- el admin lo ve en `Premios pendientes`

Pasos para cerrar entrega:

1. Entrar a `Awka Admin`.
2. Revisar `Premios pendientes`.
3. Identificar cliente, premio y fecha.
4. Tocar `Marcar entregado`.

Resultado esperado:

- el premio cambia a estado `entregado`
- queda trazabilidad operativa

## Tipos de premios actuales

La ruleta puede entregar:

- productos reales del catalogo
- descuentos
- seguir participando

Ejemplos de productos:

- Raw Classic
- Tips Silver
- Fumanchu Blanco
- Zeus Pink

Ejemplos de descuentos:

- 5% OFF
- 10% OFF
- 20% OFF

## Criterio operativo recomendado

### Cliente nuevo

- acceso al club
- puntos base
- beneficios iniciales simples

### Cliente recurrente

- mas valor por continuidad
- posibilidad de mas giros o mejores activaciones

### Cliente fiel

- beneficios mas fuertes
- activaciones especiales
- trato preferencial dentro del club

## Que hacer si algo no impacta

### Si una compra no acredita puntos

Revisar:

- que la compra haya quedado aprobada
- que el cliente haya ingresado nombre + WhatsApp
- el perfil del cliente en `Club Awka`

Si hace falta, corregir desde `Ajustar saldo`.

### Si un cliente no tiene giro

Revisar:

- si realmente se le habia prometido un giro
- si la promocion aplicaba

Si corresponde, usar `Habilitar giros`.

### Si un premio ya fue entregado fuera del panel

Entrar a `Awka Admin` y marcarlo igual como `entregado` para no perder trazabilidad.

## Variables criticas del sistema

En Vercel deben existir:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLUB_SESSION_SECRET`
- `AWKA_ADMIN_PASSWORD`
- `AWKA_ADMIN_SESSION_SECRET`

## Tablas clave en Supabase

- `clientes`
- `puntos`
- `giros_habilitados`
- `ruleta_registros`
- `club_puntos_movimientos`
- `club_compras`
- `club_premios_estado`

## Estado actual del proyecto

Este ecosistema ya esta en estado funcional y operable.

Eso significa:

- se puede publicar y usar
- se puede iterar encima sin romper la base
- el foco siguiente ya no es construir lo minimo, sino pulir y escalar

## Proximo tramo recomendado

1. Pulido visual final del ecosistema.
2. Reglas mas finas de beneficios por nivel.
3. Mejoras del panel admin.
4. Campanas y activaciones de Fase 3.
