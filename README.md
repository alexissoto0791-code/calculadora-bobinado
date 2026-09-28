# Calculadora de transformadores

Aplicación web de un solo archivo para calcular las espiras y el calibre de cobre de transformadores de distribución. Funciona en el navegador, sin instalar nada y sin enviar datos a ningún servidor.

## Qué hace

**Calcular**
- Relación de transformación (RT) por fase, según la conexión (Delta o Estrella) o monofásico.
- Espiras del secundario (N2) y del primario (N1), con dos métodos:
  - con las **espiras del tap** (N), o
  - con los **datos del núcleo**: sección y voltios por espira (o sección, inducción B y frecuencia).
- Corriente de cada devanado y **calibre AWG** del cobre. Si la corriente supera el calibre 4/0, indica cuántos conductores 4/0 en paralelo se necesitan.

**Prueba** (núcleo desconocido)
- A partir de las medidas del núcleo y de una prueba con espiras de prueba (por ejemplo a 110 V, midiendo corriente y voltaje):
  espiras de prueba recomendadas, voltios por espira, inducción del núcleo, potencia máxima estimada, espiras del primario y secundario, calibres, uso de la ventana y corriente en vacío estimada.

**Guardados**: guarda y vuelve a cargar diseños en el navegador (localStorage).

**Guía**: explicación de cada dato y de las fórmulas en lenguaje sencillo.

## Fórmulas

| Concepto | Fórmula |
|---|---|
| Espiras del secundario | `N2 = N ÷ paso del tap ÷ RT` |
| Espiras del primario | `N1 = (RT × N2) + Tap` |
| Voltios por espira | `4.44 × frecuencia × B × sección (m²)` |
| Corriente por devanado | `kVA × 1000 ÷ (fases × voltaje por fase)` |
| Sección de cobre | `corriente ÷ densidad de corriente` |
| Potencia máxima (prueba) | `2.22 × f × B × J × llenado × sección × ventana` |
| Corriente en vacío (prueba) | `amperios-vuelta de la prueba ÷ espiras del primario` |

## Cómo usarla

Abre `index.html` en el navegador. También puedes publicarla gratis con GitHub Pages (ver abajo).

## Pruebas

Las pruebas comparan los resultados de la app con valores calculados aparte. Requieren Node.js 18 o superior y no tienen dependencias:

```bash
node tests/run.js
```

Cubren conexiones Delta–Estrella, Estrella–Estrella, Delta–Delta y Estrella–Delta, monofásico, el método del núcleo, conductores en paralelo, la pestaña Prueba, la tabla AWG, las validaciones y el guardado en Supabase (con un cliente simulado, sin conectarse a ninguna base de datos).

## Guardar los diseños en Supabase (opcional)

La app guarda siempre una copia en el navegador. Si configuras Supabase, cada diseño que guardes también se envía a tu base de datos usando [`@supabase/supabase-js`](https://github.com/supabase/supabase-js) (se carga desde jsDelivr).

1. En Supabase, abre **SQL Editor > New query**, pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo. Crea la tabla `disenos` con seguridad por filas (RLS): la app solo puede **insertar**.
2. En **Project Settings > API** copia la **Project URL** y la clave **anon** (o *publishable*).
3. En `index.html`, al inicio del `<script>`, completa:

```js
var SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
var SUPABASE_KEY = 'TU-CLAVE-ANON';
var SUPABASE_TABLE = 'disenos';
```

Si tu tabla tiene otras columnas, cambia la función `filaSupabase()` en el mismo archivo.

**Seguridad:** la clave anon queda visible en la página, así que la protección real es la RLS. Nunca uses aquí la clave `service_role`. Con la política incluida, cualquier visitante podría insertar filas, pero no leer las de otros. Si necesitas leer o editar registros desde la app, agrega inicio de sesión con Supabase Auth y políticas por usuario.

**Nota:** Supabase funciona al abrir `index.html` o al publicarlo en GitHub Pages. No funciona dentro de la vista previa de Claude, que bloquea las conexiones a otros sitios.

## Publicar en GitHub Pages

1. En el repositorio, entra a **Settings > Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`.
3. Guarda. En uno o dos minutos la app queda en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Aviso

Es un cálculo de referencia. No incluye el diseño del aislamiento, las pérdidas, el calentamiento ni las normas aplicables. Un transformador de distribución debe ser revisado y probado por un profesional calificado antes de energizarlo. Las pruebas con voltaje de red se hacen con protecciones (bombilla en serie o variac, y fusible).
