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

Esto alcanza para iniciar Fase 2, pero todavia no existe un sistema formal de niveles.

## Estructura Del Programa
El programa se apoya en 3 segmentos:

1. `Nuevo`
Cliente que recien entra al ecosistema o tiene poca actividad.

2. `Recurrente`
Cliente que ya compro varias veces y mantiene una relacion activa con la marca.

3. `Fiel`
Cliente con recurrencia sostenida, mayor gasto acumulado o vinculo fuerte con Awka.

## Regla Base Recomendada
La primera version profesional debe usar criterios faciles de medir y auditar:

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
- puede recibir un beneficio de bienvenida chico
- acceso a promociones generales
- puede consultar su perfil y ver progreso

### Recurrente
- suma puntos base
- puede acceder a mas giros o mas frecuencia de activaciones
- puede recibir promociones segmentadas
- visualiza progreso hacia `Fiel`

### Fiel
- puede recibir mejores recompensas
- puede acceder a beneficios exclusivos
- puede entrar en campañas especiales
- puede tener prioridad en activaciones, preventas o premios mejorados

## Regla De Puntos V1
Mantener la regla ya implementada:

- `1 punto cada $5.000`

En V1 los puntos no cambian por nivel.
La diferencia entre niveles debe reflejarse primero en beneficios y activaciones, no en una formula de puntos distinta.

## Regla De Ruleta V1
La ruleta no debe ser universal ni permanente.
Debe ser un beneficio desbloqueable.

Regla inicial recomendada:
- `Nuevo`: giros de bienvenida o activaciones puntuales
- `Recurrente`: mas oportunidades de giro que un cliente nuevo
- `Fiel`: mejor acceso a activaciones o premios mas atractivos

La mejora de probabilidades o de pool de premios debe hacerse mas adelante, cuando el sistema ya este estable.

## Modelo De Datos Recomendado Para La Siguiente Etapa
Para profesionalizar el sistema conviene sumar 2 entidades:

### `club_compras`
Proposito:
- registrar compras aprobadas como hechos de negocio
- calcular niveles de forma auditable

Campos sugeridos:
- `id`
- `referencia`
- `telefono`
- `nombre`
- `monto_total`
- `canal`
- `estado`
- `created_at`

### `club_niveles_historial`
Proposito:
- registrar cuando un cliente cambia de nivel
- permitir auditoria y futuras campanas

Campos sugeridos:
- `id`
- `telefono`
- `nivel_anterior`
- `nivel_nuevo`
- `motivo`
- `created_at`

## Logica De Backend Recomendada
El nivel no debe guardarse a mano desde el frontend.
Debe calcularse desde backend a partir de compras aprobadas y actividad.

Proceso sugerido:
1. se aprueba una compra
2. se registra la compra en `club_compras`
3. se acreditan puntos
4. se recalcula nivel del cliente
5. si cambia de nivel, se registra en `club_niveles_historial`
6. el perfil del club devuelve nivel actual, progreso y beneficios activos

## UX Recomendada Para El Usuario
El usuario no necesita ver toda la logica interna.
La pantalla debe mostrar solo:

- nombre
- nivel actual
- puntos activos
- giros disponibles
- ultimo premio
- progreso al siguiente nivel

Ejemplos de mensajes:
- `Nivel actual: Nuevo`
- `Te falta 1 compra para pasar a Recurrente`
- `Te faltan 2 compras para llegar a Fiel`

## UX Recomendada Para Admin
El panel administrativo debe poder mostrar:

- cantidad de clientes por nivel
- clientes que estan cerca de subir
- compras aprobadas por periodo
- puntos otorgados
- activaciones de ruleta por segmento

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

## Decision Recomendada
La siguiente implementacion profesional debe ser:

1. registrar compras aprobadas en una tabla propia
2. calcular nivel desde backend
3. mostrar nivel y progreso en `Club Awka`

Ese es el paso correcto para pasar de un club con puntos a un sistema real de fidelizacion.
