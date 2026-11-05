# Días Felices: dirección visual

**La idea.** Los recuerdos de la muchachada se *revelan*. La web es un cuarto oscuro: empieza bajo la luz roja de seguridad, el papel sube a la cubeta, la cita aparece como una imagen latente, la cámara cruza las copias colgadas y, al encenderse las luces, todo es color Kodachrome.

## Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--noche` | `#140c0b` | Fondo del cuarto oscuro |
| `--cubeta` / `--cubeta-2` | `#211513` / `#33211d` | Superficies sobre la noche |
| `--papel` / `--papel-2` | `#f1eee7` / `#e3dfd5` | Copias: todo lo que se lee como objeto físico |
| `--rojo` / `--rojo-hondo` | `#d71e1e` / `#a81414` | Luz de seguridad, acción principal |
| `--azul`, `--verde`, `--amarillo` | `#1e4bd7`, `#0c7866`, `#f7c518` | Capítulos con la luz encendida |

## Tipografía

- **Shrikhand**: cursiva gorda de cartel de cine de los 70. Solo títulos, nombres y cifras grandes, nunca por debajo de 24 px.
- **Work Sans**: todo lo demás, sin mayúsculas decorativas ni etiquetas sobre los títulos.

## Materiales

- **Copia**: papel con esquinas casi rectas (2 px), un poco torcido y con sombra, porque es un objeto físico. Publicaciones, ranking, foto de perfil, avisos y formularios de acceso.
- **Campo de color**: plano a sangre con cortes secos; sin degradados.
- **Foto encontrada**: diapositivas y fotos abiertas con pie que dice lo que muestran. Nunca se presentan como la muchachada. Créditos en `assets/credits.json` y en el pie de la portada.

## Movimiento

- Portada: tres escenas sobre `js/stage.js` con GSAP ScrollTrigger y scroll nativo (`js/portada.js`). Cada una tiene una composición final, que es lo que se ve con movimiento reducido, sin script o con el CDN caído.
- Revelado: lo que llega de Supabase entra tintado de rojo y se aclara, una sola vez, sin ocultar nunca del todo el contenido (`js/ui.js`).
- Respuesta a la mano: 160 ms al pulsar (`scale(.97)`), 180 ms de color al pasar, 180–280 ms en menús y rellenos; `transform`, `opacity` y `clip-path`; hover solo con puntero fino.
- Administración: sin animaciones. Es una herramienta.

Para añadir una escena, regístrala en `Scenes` dentro de `js/portada.js`, escribe primero su composición final en `site.css` y pon lo específico de la escena en marcha bajo `.is-live`.
