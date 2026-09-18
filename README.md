# SAT PDF Local

Extensión local para solicitar una copia del PDF que ya está abierto en el visor de Aduana Digital.

> **Herramienta local · No oficial · Sin afiliación con SAT Guatemala**

## Descargar

<p><a href="https://github.com/Anser-dev/PDFgt/releases/latest/download/sat-pdf-local-0.1.0.zip"><strong>⬇️ Descargar SAT PDF Local (ZIP estable)</strong></a></p>

## Instalación fácil

1. Descarga el [ZIP estable](https://github.com/Anser-dev/PDFgt/releases/latest/download/sat-pdf-local-0.1.0.zip).
2. Descomprímelo en una carpeta permanente. No lo dejes dentro de Descargas si esa carpeta se limpia automáticamente.
3. En Chrome, abre `chrome://extensions`.
4. Activa **Modo desarrollador**.
5. Pulsa **Cargar descomprimida**.
6. Elige la carpeta descomprimida que contiene `manifest.json`.

> **Importante:** el ZIP no se instala con doble clic. Primero debes descomprimirlo y luego cargar la carpeta desde Chrome.

## Cómo usarla

1. Entra normalmente al sitio del SAT.
2. Abre **Aduana Digital** y el PDF que necesitas.
3. Cuando el PDF termine de cargar, pulsa **Descargar PDF**.
4. Revisa la carpeta de descargas de Chrome.

La extensión solo solicita la descarga cuando el visor tiene un PDF compatible. No inicia sesión ni pide credenciales.

## Si no aparece el botón

1. Confirma que el PDF terminó de cargar y espera unos segundos.
2. Recarga la página del PDF y vuelve a esperar.
3. En `chrome://extensions`, verifica que **SAT PDF Local** esté activada y pulsa **Actualizar**.
4. Si continúa sin aparecer, el visor o la página pueden no coincidir con el alcance actual de la herramienta.

No compartas contraseñas, sesiones, documentos ni otros datos privados para resolver este problema.

## Privacidad y límites

- La extensión no guarda tu contraseña ni tu sesión.
- No envía PDFs ni información a un servidor.
- Solo actúa cuando pulsas **Descargar PDF**.
- Su alcance es limitado a una página y un visor concretos de Aduana Digital.
- No evade controles de acceso ni reproduce solicitudes autenticadas.
- La validación real en el sitio del SAT está pendiente; por eso no se promete compatibilidad universal.

Consulta los detalles en [PRIVACIDAD.md](PRIVACIDAD.md).

<details>
<summary><strong>Información técnica</strong></summary>

### Manifest y alcance

- Usa **Manifest V3**.
- Declara un único content script con `world: "MAIN"`, `all_frames: true` y `run_at: "document_idle"`.
- El patrón exacto de `matches` es:

  ```text
  https://cdn.c.sat.gob.gt/aduana-digital/*
  ```

- Detecta `window.PDFViewerApplication?.pdfDocument` y requiere `getData()`.
- Valida que los bytes obtenidos comiencen con `%PDF-` antes de crear la descarga.
- La descarga se solicita mediante un `Blob` local y un enlace temporal.

### Permisos y arquitectura

El `manifest.json` no declara `permissions` ni `host_permissions`. Tampoco usa las APIs `downloads`, `tabs`, `scripting`, `storage`, `webNavigation`, `fetch`, `XMLHttpRequest` o `WebSocket`.

La arquitectura es deliberadamente mínima: un content script en el contexto principal de la página detecta el visor, muestra una interfaz pequeña dentro de un Shadow DOM y, únicamente después de la acción manual, obtiene los bytes, valida la cabecera PDF y solicita la descarga al navegador. No hay backend, service worker, telemetría, almacenamiento persistente ni código remoto.

### Desarrollo y comprobaciones

Requiere Node.js 22.23.2 (fijado en `.nvmrc`) y utilidades locales como `bash`, `zip`, `unzip` y `sha256sum`. No hay dependencias npm externas.

```bash
npm ci
npm run check
npm run build
```

`npm run check` incluye comprobación de sintaxis, formato, escaneo local de secretos, pruebas y empaquetado. La CI ejecuta esas comprobaciones después de `npm ci` y también `npm audit --audit-level=low`.

Las pruebas son sintéticas: cubren la conversión de bytes, la validación `%PDF-`, el manifest, el alcance y el empaquetado. No sustituyen una prueba real en Chrome ni la validación manual en SAT.

El paquete se verifica con:

```bash
unzip -l dist/sat-pdf-local-0.1.0.zip
(cd dist && sha256sum -c sat-pdf-local-0.1.0.zip.sha256)
```

El checksum debe contener solo el hash y `sat-pdf-local-0.1.0.zip`, sin rutas locales. El ZIP incluye en su raíz `manifest.json`, `content.js`, `README.md`, `PRIVACIDAD.md` y `FUENTES.md`.

### Estructura del repositorio

```text
extension/              Manifest y content script
scripts/package.sh      Empaquetado reproducible y checksum
tests/                  Pruebas automatizadas
PRIVACIDAD.md           Datos, límites y controles de privacidad
TESTS.md                Alcance de las pruebas y pendientes
FUENTES.md              Fuentes técnicas consultadas
```

Más información: [PRIVACIDAD.md](PRIVACIDAD.md), [TESTS.md](TESTS.md) y [FUENTES.md](FUENTES.md).

</details>
