# Diseno Del Sistema De Fidelizacion De Club Awka

## Objetivo
Definir un sistema de fidelizacion progresivo para `Club Awka` que premie la recurrencia real, evite tratar igual al cliente ocasional y al cliente fiel, y sirva como base para puntos, ruleta, beneficios y futuras campanas.

## Principios
- Todos pueden entrar al club.
- No todos reciben el mismo valor desde el primer dia.
- La fidelidad se premia por comportamiento real, no por simple registro.
- Las reglas deben vivir en backend, no en HTML.
- La UX debe mostrar resultados simples de una logica interna solida.

## Estado Actual
Hoy el sistema ya tiene:
- identidad basica por telefono en `clientes`
- saldo de puntos en `puntos`
- giros habilitados en `giros_habilitados`
- historial de ruleta en `ruleta_registros`
- auditoria de compras con puntos en `club_puntos_movimientos`
- activaciones auditables en `club_campaign_activations`

## Estructura Del Programa
El programa se apoya en 3 segmentos:

1. `Nuevo`
Cliente que recien entra al ecosistema o tiene poca actividad.

2. `Recurrente`
Cliente que ya compro varias veces y mantiene una relacion activa con la marca.

3. `Fiel`
Cliente con recurrencia sostenida, mayor gasto acumulado o vinculo fuerte con Awka.

## Regla Base Recomendada
La primera version profesional usa criterios faciles de medir y auditar:

- cantidad de compras aprobadas
- monto acumulado historico
- actividad reciente

Regla sugerida para V1:

- `Nuevo`: 0 o 1 compras aprobadas
- `Recurrente`: 2 a 4 compras aprobadas
- `Fiel`: 5 o mas compras aprobadas

Regla complementaria opcional:
- si pasaron mas de 120 dias sin actividad, el cliente puede perder beneficios temporales sin perder su historial

## Beneficios Por Nivel
### Nuevo
- suma puntos base
- puede consultar su perfil y ver progreso
- recibe `1 giro de bienvenida` en su primera compra aprobada
- puede recibir promociones generales y acciones operativas
- beneficios visibles hoy en panel:
  - perfil privado con puntos, compras y giros
  - acceso a activaciones generales del club
  - 1 giro de bienvenida en la primera compra aprobada
  - giros puntuales por acciones operativas

### Recurrente
- suma puntos base
- puede acceder a mas giros o mas frecuencia de activaciones
- visualiza progreso hacia `Fiel`
- recibe `1 giro bonus` al subir a este nivel
- recibe `1 giro de impulso` en la cuarta compra aprobada
- beneficios visibles hoy en panel:
  - activaciones mas frecuentes dentro del club
  - prioridad para giros y dinamicas promocionales
  - giro de impulso en compra 4
  - seguimiento directo del progreso hacia `Fiel`

### Fiel
- puede recibir mejores recompensas
- puede acceder a beneficios exclusivos
- entra en campanas especiales con prioridad alta
- recibe `2 giros bonus` al subir a este nivel
- desde la compra `6` entra en capa `premium`
- cada `3` compras adicionales recibe `1 giro extra`
- beneficios visibles hoy en panel:
  - beneficios exclusivos del club
  - prioridad en activaciones especiales y premios destacados
  - consolidacion premium desde la compra 6
  - 1 giro extra cada 3 compras aprobadas despues de haber alcanzado Fiel

## Regla De Puntos V1
Mantener la regla ya implementada:

- `1 punto cada $5.000`

En V1 los puntos no cambian por nivel.
La diferencia entre niveles se refleja primero en beneficios y activaciones, no en una formula de puntos distinta.

## Regla De Ruleta V1
La ruleta no debe ser universal ni permanente.
Debe ser un beneficio desbloqueable.

Regla inicial recomendada:
- `Nuevo`: giro de bienvenida y activaciones puntuales
- `Recurrente`: mas oportunidades de giro que un cliente nuevo
- `Fiel`: mejor acceso a activaciones o premios mas atractivos

La mejora de probabilidades o de pool de premios puede hacerse mas adelante, cuando el sistema ya este estable.

## Beneficio Automatico Por Segmento Y Nivel
Para cerrar la V1 del sistema:

- cuando el cliente completa su `1 compra aprobada`, recibe `1 giro de bienvenida`
- cuando el cliente llega a `2 compras aprobadas` y pasa a `Recurrente`, recibe `1 giro bonus`
- cuando el cliente completa su `4 compra aprobada`, recibe `1 giro de impulso a Fiel`
- cuando el cliente llega a `5 compras aprobadas` y pasa a `Fiel`, recibe `2 giros bonus`
- cuando el cliente completa su `6 compra aprobada`, se registra su entrada a prioridad premium
- una vez en `Fiel`, cada `3 compras aprobadas` adicionales vuelve a recibir `1 giro bonus`

Estos beneficios se acreditan o registran automaticamente cuando una nueva compra aprobada empuja la regla correspondiente.

## Campanas Segmentadas V1
El sistema ya puede mostrar campanas activas segun el nivel del cliente:

- `Nuevo`: giro de bienvenida mas empuje a segunda compra
- `Recurrente`: activaciones mas frecuentes, prioridad play e impulso a Fiel en compra 4
- `Fiel`: campanas reservadas, consolidacion premium y cadencia de giros de fidelidad

Estas campanas hoy funcionan como capa operativa y comunicacional dentro del panel y del admin.

Ademas, la capa actual ya soporta campanas contextuales:

- `cierre de nivel`: cuando el cliente queda a una compra del siguiente salto
- `reactivacion suave`: cuando el perfil lleva 30 dias o mas sin actividad reciente
- `mantenimiento premium`: cuando el cliente Fiel ya consolido su tramo premium y conviene sostener frecuencia

## Automatizaciones Auditables V1
La capa operativa registra cuando una campana se activa de verdad sobre un perfil:

- primera compra de un cliente `Nuevo`
- giro de bienvenida de `Nuevo`
- subida automatica a `Recurrente`
- impulso de `Recurrente` en la compra 4
- subida automatica a `Fiel`
- consolidacion premium de `Fiel` en la compra 6
- bonus recurrente de `Fiel` cada `3` compras adicionales

Esto permite:

- mostrar la ultima activacion en `Club Awka`
- auditar activaciones recientes desde `Awka Admin`
- dejar trazabilidad para futuras campanas temporales o estacionales

## Modelo De Datos Recomendado Para La Siguiente Etapa
Para profesionalizar el sistema conviene sostener estas entidades:

### `club_compras`
Proposito:
- registrar compras aprobadas como hechos de negocio
- calcular niveles de forma auditable

### `club_niveles_historial`
Proposito:
- registrar cuando un cliente cambia de nivel
- permitir auditoria y futuras campanas

### `club_campaign_activations`
Proposito:
- registrar activaciones automaticas disparadas por reglas del club
- medir que reglas usan mas los clientes

## Logica De Backend Recomendada
El nivel no debe guardarse a mano desde el frontend.
Debe calcularse desde backend a partir de compras aprobadas y actividad.

Proceso sugerido:
1. se aprueba una compra
2. se registra la compra en `club_compras`
3. se acreditan puntos
4. se recalcula nivel del cliente
5. se disparan reglas del segmento correspondiente
6. si cambia de nivel, se registra en `club_niveles_historial`
7. se registran activaciones en `club_campaign_activations`
8. el perfil devuelve nivel actual, progreso, beneficios y activaciones recientes

## UX Recomendada Para El Usuario
El usuario no necesita ver toda la logica interna.
La pantalla debe mostrar solo:

- nombre
- nivel actual
- puntos activos
- giros disponibles
- ultimo premio
- progreso al siguiente nivel
- beneficios activos del nivel actual
- proximo desbloqueo por subir de nivel
- ultima activacion automatica

Ejemplos de mensajes:
- `Nivel actual: Nuevo`
- `Te falta 1 compra para pasar a Recurrente`
- `Te faltan 2 compras para llegar a Fiel`
- `Te faltan 2 compras para el proximo giro de fidelidad`

## UX Recomendada Para Admin
El panel administrativo debe poder mostrar:

- cantidad de clientes por nivel
- clientes que estan cerca de subir
- compras aprobadas por periodo
- puntos otorgados
- activaciones de ruleta por segmento
- activaciones automaticas recientes

## Alcance Por Fase
### Fase 2
- puntos
- perfil
- compras conectadas
- historial
- base segura en backend

### Fase 3
- niveles formales
- beneficios por segmento
- progreso al siguiente nivel
- campanas segmentadas
- ruleta mejorada por tipo de cliente
- automatizaciones mas avanzadas

## Decision Recomendada
La siguiente implementacion profesional debe seguir este orden:

1. leer metricas y comportamiento real
2. refinar reglas por segmento
3. sumar nuevas campanas
4. automatizar solo lo que ya demuestra valor

Ese es el paso correcto para pasar de un club con puntos a un sistema real de fidelizacion operativa.
