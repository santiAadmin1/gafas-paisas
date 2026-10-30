# Backend de consultas

La aplicación usa Route Handlers de Next.js. Esta entrega no agrega base de datos ni confirma pedidos.

## Configuración

Definir `WHATSAPP_BUSINESS_NUMBER` en `gafas-paisas-vto/.env.local`: número comercial confirmado en formato internacional, con 8–15 dígitos, sin `+`, espacios ni cero inicial. No existe destino de respaldo.

## Endpoints

- `GET /api/health`: devuelve 200 y `status: ok` cuando el canal está configurado; devuelve 503 y `status: degraded` cuando falta. Nunca expone el número.
- `POST /api/consultations`: recibe JSON `{ "reference": "Montura negra" }` y prepara un enlace de WhatsApp. No envía mensajes, guarda fotos, comprueba inventario, registra pedidos ni confirma compras.

La vista de captura consume `POST /api/consultations` antes de compartir. Valida que la respuesta corresponda a la referencia solicitada, que el mensaje coincida exactamente con la plantilla compartida y que el enlace apunte por HTTPS a `wa.me`; muestra los errores del backend al usuario y evita abrir WhatsApp si la configuración falta o la respuesta no es confiable. Cancelar la hoja nativa de compartir tampoco activa el respaldo de descarga.

El cliente cancela la solicitud después de ocho segundos, incluso si la respuesta comenzó pero su cuerpo no termina de llegar, solo interpreta respuestas declaradas como `application/json`, limita la respuesta a 4096 bytes reales y convierte fallos de red en un mensaje recuperable. En favoritas se bloquean temporalmente todos los botones de compra mientras una consulta está en curso, evitando solicitudes y ventanas duplicadas.

La referencia admite 1–120 unidades UTF-16, Unicode bien formado y ningún carácter de control. Solo se admite ese campo. El cuerpo se limita a 1024 bytes reales y cinco segundos de lectura. Si `Content-Length` ya declara un exceso, se rechaza antes de leer el flujo; declarar un valor menor no evita la comprobación de bytes reales. Las respuestas usan `Cache-Control: no-store`.

## Verificación

```bash
npm ci
npm run test:api
npm run lint
npx tsc --noEmit
npm run build
```

Pendiente: conectar la interfaz, confirmar el número comercial, definir catálogo e inventario autoritativos y diseñar persistencia, autorización y protección distribuida contra abuso antes de implementar pedidos reales.
