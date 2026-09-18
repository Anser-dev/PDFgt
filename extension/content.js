(function satPdfLocal() {
  "use strict";

  const HOST_ID = "sat-pdf-local-host";
  const POLL_INTERVAL_MS = 750;
  const URL_REVOKE_DELAY_MS = 60_000;
  const PDF_HEADER = "%PDF-";
  const globalState = window.__SAT_PDF_LOCAL_STATE__;

  if (globalState?.started) {
    return;
  }

  const state = {
    started: true,
    host: null,
    shadowRoot: null,
    button: null,
    status: null,
    pollTimer: null,
    observer: null,
    pdfDocument: null,
    busy: false
  };
  window.__SAT_PDF_LOCAL_STATE__ = state;

  function getPdfDocument() {
    return window.PDFViewerApplication?.pdfDocument ?? null;
  }

  function isCompatiblePdfDocument(pdfDocument) {
    return Boolean(pdfDocument && typeof pdfDocument.getData === "function");
  }

  function setStatus(message, kind) {
    if (!state.status) {
      return;
    }
    state.status.textContent = message;
    state.status.dataset.kind = kind || "info";
  }

  function updateAvailability() {
    const currentDocument = getPdfDocument();
    state.pdfDocument = isCompatiblePdfDocument(currentDocument) ? currentDocument : null;

    if (!state.button || state.busy) {
      return;
    }

    state.button.disabled = !state.pdfDocument;
    if (state.pdfDocument) {
      setStatus("PDF disponible para descarga manual.", "ready");
    } else {
      setStatus("Esperando un documento PDF compatible.", "waiting");
    }
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function buildFilename(date) {
    const stamp = [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("") + "-" + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join("");
    return `sat-pdf-${stamp}.pdf`;
  }

  function hasPdfHeader(bytes) {
    if (!bytes || bytes.length < PDF_HEADER.length) {
      return false;
    }
    for (let index = 0; index < PDF_HEADER.length; index += 1) {
      if (bytes[index] !== PDF_HEADER.charCodeAt(index)) {
        return false;
      }
    }
    return true;
  }

  function asUint8Array(data) {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    return null;
  }

  async function downloadCurrentPdf() {
    if (state.busy) {
      return;
    }

    const capturedDocument = getPdfDocument();
    if (!isCompatiblePdfDocument(capturedDocument)) {
      updateAvailability();
      setStatus("El documento PDF ya no está disponible.", "error");
      return;
    }

    state.busy = true;
    state.button.disabled = true;
    setStatus("Preparando la descarga…", "busy");
    let finalStatus = null;

    try {
      const data = await capturedDocument.getData();
      const bytes = asUint8Array(data);
      if (!bytes || bytes.byteLength === 0 || !hasPdfHeader(bytes)) {
        throw new Error("El documento no contiene bytes PDF válidos.");
      }
      if (getPdfDocument() !== capturedDocument) {
        throw new Error("El documento cambió durante la descarga.");
      }

      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = buildFilename(new Date());
      anchor.hidden = true;
      document.documentElement.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), URL_REVOKE_DELAY_MS);
      finalStatus = { message: "Descarga solicitada al navegador.", kind: "success" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo preparar la descarga.";
      finalStatus = { message, kind: "error" };
    } finally {
      state.busy = false;
      updateAvailability();
      if (finalStatus) {
        setStatus(finalStatus.message, finalStatus.kind);
      }
    }
  }

  function createUi() {
    if (document.getElementById(HOST_ID)) {
      return;
    }

    state.host = document.createElement("div");
    state.host.id = HOST_ID;
    state.host.setAttribute("data-sat-pdf-local", "true");
    state.shadowRoot = state.host.attachShadow({ mode: "open" });
    state.shadowRoot.innerHTML = `
      <style>
        :host { all: initial; }
        .panel { position: fixed; z-index: 2147483647; right: 16px; bottom: 16px; display: grid; gap: 6px; max-width: min(320px, calc(100vw - 32px)); padding: 12px; border: 1px solid #9aa4b2; border-radius: 8px; background: #ffffff; color: #17202a; box-shadow: 0 4px 16px rgb(0 0 0 / 18%); font: 14px/1.35 system-ui, sans-serif; }
        button { min-height: 40px; padding: 8px 12px; border: 1px solid #155eef; border-radius: 6px; background: #155eef; color: #ffffff; cursor: pointer; font: inherit; font-weight: 600; }
        button:disabled { cursor: not-allowed; opacity: .55; }
        button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
        .status { margin: 0; }
        .status[data-kind="error"] { color: #b42318; }
        .status[data-kind="success"] { color: #067647; }
      </style>
      <div class="panel" role="region" aria-label="SAT PDF Local">
        <button type="button" disabled>Descargar PDF</button>
        <p class="status" role="status" aria-live="polite">Esperando un documento PDF compatible.</p>
      </div>`;

    state.button = state.shadowRoot.querySelector("button");
    state.status = state.shadowRoot.querySelector(".status");
    state.button.addEventListener("click", downloadCurrentPdf);
    document.documentElement.appendChild(state.host);
    updateAvailability();
  }

  function startDetection() {
    createUi();
    state.pollTimer = window.setInterval(updateAvailability, POLL_INTERVAL_MS);
    state.observer = new MutationObserver(updateAvailability);
    state.observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (window.__SAT_PDF_LOCAL_TEST__) {
    window.__SAT_PDF_LOCAL_TEST_HOOKS__ = { asUint8Array, buildFilename, hasPdfHeader };
    return;
  }

  startDetection();
}());
