# Días Felices

Un pequeño rincón privado para guardar anécdotas, bromas y recuerdos de la pandilla. La interfaz está hecha con HTML, CSS y JavaScript sin proceso de compilación; Supabase gestiona las cuentas y los datos.

## Páginas

- `index.html`: portada y accesos principales.
- `blog.html`: muro de publicaciones.
- `perfil.html`: perfil del usuario.
- `ranking.html` y `encuestas.html`: secciones para usuarios registrados.
- `login.html` y `registro.html`: acceso y creación de cuentas.
- `admin.html` y `gestion-usuarios.html`: herramientas de administración.
- `menu.html`: navegación compartida, cargada en cada página.
- `site.css`: estilos visuales compartidos.
- `js/auth.js`: autenticación y navegación según sesión y rol.

## Ejecutar en local

Como las páginas cargan `menu.html` con `fetch`, abre el proyecto con un servidor local en vez de abrir el HTML directamente. Por ejemplo, con Python:

```bash
python -m http.server 8000
```

Después visita <http://localhost:8000>.

## Publicar con GitHub Pages

1. Sube la rama que quieras publicar a GitHub.
2. En el repositorio, abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**, elige la rama y la carpeta raíz (`/`), y guarda.
4. Cuando termine la publicación, GitHub mostrará la dirección del sitio en esa misma sección.

La aplicación usa Supabase desde el navegador. Antes de publicar, revisa las políticas de acceso (RLS) de las tablas y configura en Supabase las URL de redirección de autenticación para el dominio de GitHub Pages. La clave incluida en el cliente debe ser únicamente una clave publicable; nunca pongas una clave `service_role` en estos archivos.

## Base de datos

El diagrama relacional está en [`dias_felices.pdf`](dias_felices.pdf).
