# Pruebas

## Pruebas sintéticas automatizadas

Comando:

```bash
npm ci
npm test
npm run security:scan
```

El archivo `tests/content.test.js` ejecuta el content script en un contexto VM sintético y comprueba:

- aceptación de bytes con cabecera `%PDF-` y rechazo de bytes vacíos/no PDF;
- conversión de `Uint8Array`, `ArrayBuffer` y vistas tipadas;
- nombre portable con fecha/hora, sin datos de la página.
- detección de un token sintético y exclusión de documentación con placeholders.

Estas pruebas **no son una prueba de Chrome**, ni prueban el visor del SAT.

El proyecto usa JavaScript nativo sin TypeScript: no aplica un typecheck separado. `npm run lint` ejecuta `node --check` sobre el código y las pruebas para validar el parseo.

## Validación estática y del paquete

El empaquetado se realiza con:

```bash
npm run package
unzip -l dist/sat-pdf-local-0.1.0.zip
(cd dist && sha256sum -c sat-pdf-local-0.1.0.zip.sha256)
```

`npm run format:check` verifica formato textual básico y `npm run check` ejecuta syntax check, formato, escaneo local de secretos, pruebas y build. CI ejecuta ese conjunto después de `npm ci` y además corre `npm audit --audit-level=low`.

El checksum debe contener solo el hash y `sat-pdf-local-0.1.0.zip`, sin rutas absolutas, separadores de directorio ni nombres locales. La validación debe comprobar desde `dist` que `manifest.json` está en la raíz del ZIP y que no aparecen `tests/`, `scripts/`, secretos o datos privados.

## Pendiente

- Prueba real en Chrome/Chromium con una página local sintética que exponga un visor PDF compatible.
- Validación manual en SAT, siempre sin credenciales proporcionadas a la extensión y sin afirmar compatibilidad hasta realizarla.
