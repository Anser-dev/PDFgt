# Fuentes primarias

Documentación oficial consultada el 18 de septiembre de 2026:

- Chrome for Developers, **Content scripts**: <https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts>
  - Confirma declaraciones estáticas mediante `content_scripts`, `matches`, `all_frames`, `run_at` y `world`.
  - Confirma que `all_frames` evalúa cada frame de forma independiente según los requisitos de URL.
  - Confirma que `world: "MAIN"` ejecuta el script en el entorno principal de la página y que la CSP de la página aplica allí.
- Chrome for Developers, **Manifest content_scripts reference**: <https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts>
  - Confirma la forma declarativa del bloque usado por esta extensión y los valores por defecto relevantes.
- Chrome for Developers, **Hello World extension — Load an unpacked extension**: <https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world>
  - Confirma la carga local mediante `chrome://extensions`, Modo desarrollador y **Load unpacked**.

La implementación no depende de APIs adicionales de Chrome. No se accedió a una sesión real del SAT ni se hizo una prueba contra el sitio.
