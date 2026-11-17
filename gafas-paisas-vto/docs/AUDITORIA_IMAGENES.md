# Revisión de imágenes del probador · 17 de noviembre de 2026

El catálogo cargado pasa de 96 a **140 referencias** (las 140 visibles al público). Cada una tiene frente y patilla: **280 PNG transparentes**. Las 16 referencias históricas de dos dígitos permanecen inactivas; sus rutas también se comprobaron, pero no se reactivaron sus emparejamientos dudosos.

## Qué cambió

- Se revisaron visualmente los 96 pares existentes y se comprobaron resolución, transparencia y contenido. Se conservaron sus PNG originales.
- Se incorporaron GP-097 a GP-140: 88 vistas reconstruidas con IA, 44 miniaturas y las 44 fotos originales del RAR.
- Las vistas nuevas usan PNG RGBA de 1.200 px de ancho, proporciones conservadas y 34 px de margen transparente. La patilla tiene la bisagra a la izquierda. Las miniaturas son JPG de 320 × 160.
- GP-138 recibió una segunda corrección para quitar el marco superior añadido por IA y hacer transparentes los lentes claros.
- El probador calcula las uniones sobre los píxeles visibles, compensa los márgenes de la patilla y gira desde la bisagra. La patilla escala con el frente. Los anclajes se guardan en memoria para no repetir el análisis de píxeles al cambiar de tamaño.
- Las referencias nuevas tienen `reconstruidaIA: true`, confianza media y un aviso en sus metadatos. Desde el 17/11/2026 son **visibles al público** (`MOSTRAR_VISTAS_IA = true` en `src/lib/catalog.ts`) con su categoría asignada; el catálogo público muestra las 140 referencias.

## Revisión visual

Cada lámina muestra el frente y su patilla bajo el mismo código.

| Referencias | Lámina |
|---|---|
| GP-001–016 | [Ver](revision-imagenes/anteriores-1.png) |
| GP-017–032 | [Ver](revision-imagenes/anteriores-2.png) |
| GP-033–048 | [Ver](revision-imagenes/anteriores-3.png) |
| GP-049–064 | [Ver](revision-imagenes/anteriores-4.png) |
| GP-065–080 | [Ver](revision-imagenes/anteriores-5.png) |
| GP-081–096 | [Ver](revision-imagenes/anteriores-6.png) |
| GP-097–112 | [Ver](revision-imagenes/nuevas-1.png) |
| GP-113–128 | [Ver](revision-imagenes/nuevas-2.png) |
| GP-129–140 | [Ver](revision-imagenes/nuevas-3.png) |

Las fotos originales nuevas están en `public/catalogo/originales/GP-XXX.jpg`. El registro de cada reconstrucción, resolución y recorte está en [reconstrucciones-097-140.json](reconstrucciones-097-140.json).

## Validación

- `node scripts/check-catalog.mjs`: 156 registros, 468 rutas y 2 alias válidos.
- `node scripts/check-image-anchors.mjs`: pruebas sintéticas y las 280 imágenes activas; resolución, contenido, transparencia y anclajes.
- `npm run build`: compilación y TypeScript correctos; exportación estática generada en `out/`.
- `npm run lint`: sin errores; cinco advertencias preexistentes sobre fuentes y etiquetas de imagen.
- Comparación visual del renderizador anterior y corregido con giro simulado de 35°: GP-002, GP-004, GP-011, GP-075, GP-082 y GP-096. El hueco entre patilla y frente se cierra en la simulación.
- Comprobación ampliada con el cargador real `processCatalogModel`: **140/140 referencias cargadas**, incluidas sus miniaturas y patillas; **420 vistas** (−35°, 0° y +35°), **0 errores**. La distancia entre anclajes queda por debajo de 1,85 px en un lienzo de 600 × 250, dentro de la tolerancia de 3 px. Registro por referencia y ángulo: [verificacion-runtime-140.json](verificacion-runtime-140.json).
- [Comparación visual antes/después](revision-imagenes/comparacion-bisagras.jpg). La interfaz del aplicativo también mostró las 140 referencias y los 44 avisos de revisión IA.

## Pendientes de fidelidad

El RAR contiene **una foto en perspectiva por referencia**, no dos tomas ortogonales. Las 44 nuevas vistas son aproximaciones autorizadas por el usuario: no certifican la geometría oculta, grabados, detalles de bisagras ni color exacto. Deben compararse con el producto físico antes de quitar el aviso de revisión. Las medidas de 140 mm son aproximadas, siguiendo el catálogo existente; reemplazarlas por medidas reales permite calibrar mejor la escala.

La prueba con cámara real y los giros amplios siguen pendientes. El sistema usa planos 2D en una escena 3D: no reconstruye el volumen completo de la montura y una sola foto de patilla se comparte entre ambos lados. No se publicó ni se hizo push a Netlify.

## Criterio de reconstrucción

Se usó la herramienta de imágenes integrada, con un trabajo por referencia: conservar silueta, puente, colores y herrajes de la foto; generar un frente ortogonal sin patillas detrás de los lentes y una patilla aislada con bisagra izquierda; fondo transparente; sin objetos, sombras ni reflejos de la habitación. Se conservaron los originales y se verificó la asignación de las 44 salidas a sus códigos.
