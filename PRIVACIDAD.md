# Privacidad

SAT PDF Local funciona únicamente en la página coincidente con el patrón declarado en `extension/manifest.json`.

## Datos y permisos

- No solicita permisos API ni permisos de host separados.
- No lee cookies, tokens, credenciales, formularios ni identificadores de usuario.
- No realiza solicitudes de red ni envía información a terceros.
- No usa almacenamiento persistente, service worker, telemetría, analítica ni código remoto.
- No inspecciona nombres, metadatos o URL del documento para construir el archivo.
- El nombre generado solo contiene la fecha y hora local de la acción: `sat-pdf-YYYYMMDD-HHMMSS.pdf`.

El PDF permanece en el contexto del navegador hasta que se crea el `Blob` para solicitar la descarga manual. La URL temporal del `Blob` se revoca luego de un intervalo diferido para no interrumpir la solicitud del navegador.

## Limitación

El visor y el sitio pueden cambiar. La extensión no evade controles de acceso, no reproduce solicitudes autenticadas y no afirma ser oficial del SAT.
