# Prompts para preparar fotos de gafas

Prompts para convertir fotos de catálogo (en ángulo, con fondo o con decoración) en imágenes listas para el probador virtual, usando un generador de imágenes como ChatGPT.

- **Foto frontal** → botón **"Subir gafas"**.
- **Foto de la pata** → botón **"+ pata"**.

## Consejos

- **Revisar cada resultado contra la gafa real.** El generador *redibuja* la imagen y a veces cambia detalles (forma del puente, logo, grosor). La imagen tiene que coincidir con el producto que se vende.
- **Una gafa por chat.** Si se mezclan varias, el generador combina detalles de una y otra.
- **Si sale con perspectiva o sombra**, responder en el mismo chat: *"Más de frente, totalmente plana, sin sombra, fondo #F5F5F5."*
- El fondo gris claro y parejo (#F5F5F5) es el que mejor recorta la app: separa la gafa del fondo sin borrar los lentes.

---

## 1. Prompt para la foto frontal

```text
OBJETIVO
Vas a recibir una foto de una gafa tomada de un catálogo, de una red social o de una foto de producto con ambientación (cajas, estuches, mesas, decoración, reflejos, ángulos inclinados). Tu tarea es generar una nueva imagen de ESA MISMA GAFA, convertida en una foto de producto de estudio, vista completamente de frente, sobre un fondo liso. La imagen se va a usar en un probador virtual de gafas que superpone la gafa sobre la cara de una persona en tiempo real, así que la precisión de la forma, el tamaño de los elementos y la limpieza del fondo son críticos.

PASO 1 — IDENTIFICA LA GAFA
Antes de generar, analiza la foto adjunta e identifica:
- El tipo de montura: completa, semi al aire (solo con barra superior), sin montura (rimless, lentes perforados), deportiva de lente único (tipo máscara/escudo), aviador, rectangular, redonda, cat-eye, hexagonal, etc.
- El material y acabado: metal brillante, metal cepillado o mate, acetato brillante, acetato mate, inyectado/plástico, titanio, combinación.
- El color exacto de la montura y de cada parte (frente, puente, plaquetas, bisagras, terminales).
- El tipo de lente: transparente, tintado sólido, degradado (más oscuro arriba y más claro abajo), espejado (con reflejo de color: azul, dorado, rojo, arcoíris, plata), polarizado, fotocromático.
- Los logos y textos visibles: marca en el lente, en la bisagra o en el frente, y su posición exacta.
- Si la foto está en ángulo, deduce cómo se ve la gafa de frente usando la simetría: una gafa es simétrica respecto a su centro (el puente), así que el lado que se ve mejor sirve de referencia para el otro.

PASO 2 — COMPOSICIÓN Y ENCUADRE
- Vista FRONTAL PURA, ortográfica: la cámara está exactamente delante de la gafa, centrada en el puente, a la altura de los lentes. Sin ángulo lateral, sin ángulo desde arriba o desde abajo, sin perspectiva, sin distorsión de lente gran angular.
- La gafa debe verse perfectamente simétrica: el lente izquierdo y el derecho del mismo tamaño y a la misma altura, el puente exactamente en el centro horizontal de la imagen.
- La gafa totalmente horizontal (sin rotación ni inclinación).
- Tamaño de la imagen: horizontal, 1600 x 600 píxeles (proporción 8:3). Si no puedes ese tamaño exacto, usa la proporción horizontal más cercana.
- La gafa ocupa aproximadamente el 90% del ancho de la imagen, con un margen pequeño e igual a cada lado, y centrada en altura.
- Las patas (varillas laterales) deben estar plegadas o ocultas detrás de la montura de modo que NO se vean extendidas hacia los lados ni hacia la cámara. Solo deben verse los extremos laterales de la montura y las bisagras, como en una foto de catálogo frontal.

PASO 3 — FONDO
- Fondo completamente liso y uniforme, de color gris muy claro casi blanco: #F5F5F5.
- Sin degradados, sin viñeta, sin textura, sin piso, sin línea de horizonte, sin superficie donde se apoye la gafa.
- Sin sombras de ningún tipo: ni sombra proyectada debajo de la gafa, ni sombra de contacto, ni halo alrededor.
- Sin reflejos de la gafa sobre el fondo.
- Elimina absolutamente todo lo que no sea la gafa: cajas, estuches, libros, frascos, telas, soportes, manos, maniquíes, etiquetas, precios, marcas de agua, textos promocionales y logotipos de tiendas.

PASO 4 — FIDELIDAD AL PRODUCTO REAL (LO MÁS IMPORTANTE)
Esta imagen representa un producto real que un cliente va a comprar. NO rediseñes la gafa.
- Conserva exactamente la forma del contorno de cada lente, incluidas las esquinas, curvas y cortes.
- Conserva el grosor real de la montura en cada zona (más gruesa arriba, más delgada abajo, etc.).
- Conserva la forma y la altura del puente y la posición y el tamaño de las plaquetas nasales, si las tiene.
- Conserva el color exacto de la montura, sin saturarlo ni cambiar su tono.
- Conserva el acabado: si es mate, que siga mate; si es brillante, con brillos suaves y realistas.
- Conserva los logos y textos en la misma posición, tamaño y estilo. No inventes logos, no cambies la marca, no agregues texto.
- No agregues adornos, detalles, tornillos ni piezas que no estén en la gafa original. No quites piezas que sí estén.
- Si alguna parte no se ve en la foto original (por el ángulo), reconstrúyela de la forma más simple y coherente con el resto de la gafa, usando la simetría.

PASO 5 — LENTES
- Los lentes deben verse completos, de borde a borde, con su color y efecto reales.
- Lentes espejados: conserva el color del espejado y su degradado característico, sin reflejar objetos, personas ni el entorno de la foto original.
- Lentes tintados o degradados: conserva el tono y la dirección del degradado (normalmente más oscuro arriba).
- Lentes transparentes: que se vean como vidrio limpio con un brillo muy suave en una esquina, mostrando el fondo gris claro detrás.
- Los lentes NO deben mostrar el fondo de la foto original (mesa, caja, pared) a través de ellos.
- En gafas deportivas de lente único (tipo escudo), el lente es una sola pieza continua que puede sobresalir de la montura por los lados y por abajo: consérvalo completo.
- En gafas sin montura (rimless), los bordes del lente deben verse nítidos y definidos, con un fino borde biselado, para que se distinga claramente dónde termina el lente.

PASO 6 — ILUMINACIÓN Y CALIDAD
- Iluminación de estudio suave, pareja y frontal, como en un catálogo de e-commerce profesional.
- Sin luces duras, sin destellos fuertes, sin reflejos blancos grandes sobre los lentes que tapen su color.
- Imagen nítida y enfocada en toda la gafa, sin desenfoque, sin ruido, sin compresión visible.
- Bordes de la montura limpios y definidos contra el fondo, sin halos, sin contornos blancos ni recortes irregulares.

LO QUE NO DEBES HACER
- No muestres la gafa en ángulo, de tres cuartos, de lado ni desde arriba.
- No dejes las patas abiertas hacia los lados ni hacia la cámara.
- No agregues sombras, piso, reflejos ni decoración.
- No agregues personas, caras, maniquíes ni manos.
- No cambies el modelo, la forma, el color, la marca ni los detalles de la gafa.
- No agregues texto, marcas de agua, bordes ni marcos a la imagen.
- No entregues varias gafas en la misma imagen.

ENTREGA
Entrega solo la imagen final, sin explicación. Si la foto adjunta no permite ver bien la gafa (está muy cortada, muy borrosa o tapada), avísame qué parte no se ve en lugar de inventarla.
```

---

## 2. Prompt para la pata

```text
OBJETIVO
Vas a recibir una foto de una gafa tomada de un catálogo, de una red social o de una foto de producto con ambientación (cajas, estuches, mesas, decoración, ángulos inclinados). Tu tarea es generar una nueva imagen que muestre SOLO UNA PATA (la varilla lateral que va de la bisagra hasta detrás de la oreja) de ESA MISMA GAFA, vista completamente de lado, como foto de producto de estudio sobre un fondo liso. La imagen se va a usar en un probador virtual de gafas que coloca esta pata a los lados de la cara de una persona en tiempo real, empalmándola con la bisagra de la montura. Por eso la orientación, la posición de la bisagra y la limpieza del fondo son críticas.

PASO 1 — IDENTIFICA LA PATA
Antes de generar, analiza la foto adjunta e identifica:
- La forma de la pata: recta, recta con curva final hacia abajo, curva tipo "cable" que envuelve la oreja, deportiva ancha, delgada de metal, ancha de acetato.
- El material y acabado: metal brillante, metal cepillado o mate, acetato brillante, acetato mate, inyectado/plástico, goma en la punta, combinación.
- El color exacto de cada zona: la parte cercana a la bisagra, el cuerpo de la pata y el terminal (la punta que va detrás de la oreja, que a menudo es de otro material o color).
- El grosor y el ancho: si se ensancha cerca de la bisagra y se afina hacia la punta, o si es pareja.
- Los logos, textos o placas decorativas (marca grabada, placa metálica, franja de color) y su posición exacta a lo largo de la pata.
- Si en la foto la pata se ve en ángulo, de frente o parcialmente tapada, deduce cómo se ve completamente de lado usando lo que sí se alcanza a ver y la forma habitual de ese tipo de pata.

PASO 2 — ORIENTACIÓN (MUY IMPORTANTE)
- Vista LATERAL PURA, ortográfica: la cámara mira la pata exactamente de lado, perpendicular a ella. Sin perspectiva, sin ángulo desde arriba o desde abajo, sin que la pata se vea acortada.
- La pata acostada en HORIZONTAL.
- La BISAGRA (el extremo que se une a la montura) va en el borde IZQUIERDO de la imagen.
- La PUNTA (el extremo que va detrás de la oreja) va en el borde DERECHO de la imagen.
- Si la pata tiene una curva final, esa curva debe ir HACIA ABAJO en el extremo derecho, como cuando la gafa está puesta y la pata baja por detrás de la oreja.
- La cara exterior de la pata (la que se ve desde afuera cuando la persona tiene la gafa puesta, normalmente donde está el logo) debe mirar hacia la cámara.
- La pata completa, de un extremo a otro, sin cortar ninguna parte.

PASO 3 — COMPOSICIÓN Y ENCUADRE
- Tamaño de la imagen: horizontal, 1600 x 600 píxeles (proporción 8:3). Si no puedes ese tamaño exacto, usa la proporción horizontal más cercana.
- La pata ocupa aproximadamente el 95% del ancho de la imagen: la bisagra muy cerca del borde izquierdo y la punta muy cerca del borde derecho, con un margen pequeño e igual a cada lado.
- La parte recta de la pata, cerca de la bisagra, centrada en altura (en la mitad vertical de la imagen).
- Muestra SOLO la pata: sin el frente de la montura, sin los lentes, sin la otra pata. Si la bisagra tiene una pequeña pieza de la montura unida, puede verse solo esa pieza mínima de unión.

PASO 4 — FONDO
- Fondo completamente liso y uniforme, de color gris muy claro casi blanco: #F5F5F5.
- Sin degradados, sin viñeta, sin textura, sin piso, sin línea de horizonte, sin superficie donde se apoye la pata.
- Sin sombras de ningún tipo: ni sombra proyectada debajo de la pata, ni sombra de contacto, ni halo alrededor.
- Sin reflejos de la pata sobre el fondo.
- Elimina absolutamente todo lo que no sea la pata: cajas, estuches, libros, frascos, telas, soportes, manos, etiquetas, precios, marcas de agua, textos promocionales y logotipos de tiendas.

PASO 5 — FIDELIDAD AL PRODUCTO REAL (LO MÁS IMPORTANTE)
Esta imagen representa un producto real que un cliente va a comprar. NO rediseñes la pata.
- Conserva exactamente la forma, la curvatura y el largo proporcional de la pata.
- Conserva el grosor y el ancho reales en cada zona, incluido cómo se afina hacia la punta.
- Conserva el color exacto de cada zona, sin saturarlo ni cambiar su tono, incluido el terminal si es de otro color o material.
- Conserva el acabado: si es mate, que siga mate; si es brillante, con brillos suaves y realistas.
- Conserva los logos, textos y placas en la misma posición, tamaño y estilo. No inventes logos, no cambies la marca, no agregues texto.
- Conserva la forma de la bisagra (tornillos, resorte, pieza metálica) tal como es.
- No agregues adornos, franjas, grabados ni piezas que no estén en la pata original. No quites piezas que sí estén.
- Si alguna parte no se ve en la foto original, reconstrúyela de la forma más simple y coherente con el resto de la pata.

PASO 6 — ILUMINACIÓN Y CALIDAD
- Iluminación de estudio suave, pareja y frontal, como en un catálogo de e-commerce profesional.
- Sin luces duras, sin destellos fuertes, sin reflejos blancos grandes que tapen el color o el logo.
- Imagen nítida y enfocada en toda la pata, sin desenfoque, sin ruido, sin compresión visible.
- Bordes de la pata limpios y definidos contra el fondo, sin halos, sin contornos blancos ni recortes irregulares.

LO QUE NO DEBES HACER
- No muestres la pata en ángulo, de frente, desde arriba ni en perspectiva.
- No pongas la bisagra a la derecha ni la punta a la izquierda.
- No pongas la curva final hacia arriba.
- No muestres la gafa completa, el frente de la montura ni los lentes.
- No muestres las dos patas, solo una.
- No agregues sombras, piso, reflejos ni decoración.
- No agregues personas, orejas, cabezas, maniquíes ni manos.
- No cambies el modelo, la forma, el color, la marca ni los detalles de la pata.
- No agregues texto, marcas de agua, bordes ni marcos a la imagen.

ENTREGA
Entrega solo la imagen final, sin explicación. Si la foto adjunta no permite ver bien la pata (está tapada, muy cortada, muy borrosa o no aparece), avísame qué parte no se ve en lugar de inventarla.
```
