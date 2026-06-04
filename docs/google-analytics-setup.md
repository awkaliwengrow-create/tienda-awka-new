## Google Analytics 4 en Awka

### Que ya quedó instalado
- carga base de GA4 en todas las páginas principales
- medición de:
  - visitas de página
  - agregar al carrito
  - inicio de checkout
  - compra aprobada
  - login en Club Awka
  - canje de recompensa
  - resultado de la ruleta
  - clics a WhatsApp

### Lo único que falta para activarlo
Abre este archivo:

`data/analytics-config.js`

Y pega tu Measurement ID de GA4 en `measurementId`.

Ejemplo:

```js
window.AWKA_ANALYTICS = {
    measurementId: 'G-XXXXXXXXXX',
    debug: false
};
```

### Cómo conseguir ese código
En Google Analytics 4:
- Administrar
- Flujos de datos
- Web
- Measurement ID

Se ve como:
- `G-XXXXXXXXXX`

### Después de pegarlo
1. publica el sitio
2. entra a la web
3. navega, agrega algo al carrito y prueba un checkout
4. revisa en GA4 el informe en tiempo real

### Archivos involucrados
- `data/analytics-config.js`
- `js/analytics.js`
- `js/shop.js`
- `js/club.js`
- `js/ruleta.js`
