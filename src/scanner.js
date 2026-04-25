/**
 * scanner.js — Reusable barcode / QR scanner modal
 * Uses html5-qrcode library. Works on mobile and desktop cameras.
 * 
 * Usage:
 *   import { openScanner } from "./scanner.js";
 *   openScanner({
 *     title: "Escanear Producto",
 *     onScan: (code) => { console.log("Scanned:", code); }
 *   });
 */
import { Html5Qrcode } from "html5-qrcode";

let _scanner = null;
let _isRunning = false;
let _onScanCallback = null;

// DOM refs (created once)
let modal, backdrop, closeBtn, readerEl, statusEl, titleEl, manualInput, manualBtn;

function ensureDOM() {
  if (document.getElementById("scanner-modal")) return;

  const html = `
    <div id="scanner-modal" class="hidden fixed inset-0 z-[60] items-center justify-center p-4">
      <div id="scanner-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-surface-variant">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings:'FILL' 1">qr_code_scanner</span>
            <h3 id="scanner-title" class="font-bold text-on-surface text-sm">Escanear Código</h3>
          </div>
          <button id="scanner-close" class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <!-- Camera viewer -->
        <div class="bg-black">
          <div id="scanner-reader" class="w-full" style="min-height: 280px;"></div>
        </div>
        <!-- Status -->
        <div id="scanner-status" class="px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low">
          Iniciando cámara...
        </div>
        <!-- Manual input fallback -->
        <div class="px-5 py-4 border-t border-surface-variant">
          <p class="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mb-2">O ingresa manualmente</p>
          <div class="flex gap-2">
            <input id="scanner-manual-input" type="text" placeholder="Escribe el código..."
              class="flex-1 bg-surface-container border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            <button id="scanner-manual-btn"
              class="px-4 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">check</span> OK
            </button>
          </div>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  // Bind refs
  modal = document.getElementById("scanner-modal");
  backdrop = document.getElementById("scanner-backdrop");
  closeBtn = document.getElementById("scanner-close");
  readerEl = document.getElementById("scanner-reader");
  statusEl = document.getElementById("scanner-status");
  titleEl = document.getElementById("scanner-title");
  manualInput = document.getElementById("scanner-manual-input");
  manualBtn = document.getElementById("scanner-manual-btn");

  // Events
  closeBtn.addEventListener("click", closeScanner);
  backdrop.addEventListener("click", closeScanner);
  manualBtn.addEventListener("click", handleManualInput);
  manualInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleManualInput();
  });
}

function handleManualInput() {
  const code = manualInput.value.trim();
  if (!code) return;
  if (_onScanCallback) _onScanCallback(code);
  closeScanner();
}

export async function openScanner({ title = "Escanear Código", onScan } = {}) {
  ensureDOM();
  _onScanCallback = onScan;

  titleEl.textContent = title;
  manualInput.value = "";
  statusEl.textContent = "Iniciando cámara...";
  statusEl.className = "px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low";

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Small delay to allow modal to render before starting camera
  await new Promise(r => setTimeout(r, 300));

  try {
    _scanner = new Html5Qrcode("scanner-reader");
    const cameras = await Html5Qrcode.getCameras();

    if (!cameras || cameras.length === 0) {
      statusEl.textContent = "⚠️ No se detectaron cámaras. Usa la entrada manual.";
      statusEl.className = "px-5 py-3 text-center text-sm text-amber-800 bg-amber-50";
      return;
    }

    // Prefer back camera
    const backCam = cameras.find(c => c.label.toLowerCase().includes("back") || c.label.toLowerCase().includes("rear") || c.label.toLowerCase().includes("trasera"));
    const camId = backCam ? backCam.id : cameras[cameras.length - 1].id;

    _isRunning = true;
    await _scanner.start(
      camId,
      {
        fps: 10,
        qrbox: { width: 250, height: 200 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        // Success!
        statusEl.textContent = `✅ Detectado: ${decodedText}`;
        statusEl.className = "px-5 py-3 text-center text-sm text-green-800 bg-green-50 font-bold";
        
        if (_onScanCallback) _onScanCallback(decodedText);
        
        // Auto-close after a brief moment
        setTimeout(() => closeScanner(), 600);
      },
      () => { /* ignore errors during scanning */ }
    );

    statusEl.textContent = "📷 Apunta al código de barras o QR...";
    statusEl.className = "px-5 py-3 text-center text-sm text-blue-800 bg-blue-50 font-medium";

  } catch (err) {
    console.error("Scanner error:", err);
    statusEl.textContent = "⚠️ No se pudo acceder a la cámara. Usa la entrada manual.";
    statusEl.className = "px-5 py-3 text-center text-sm text-amber-800 bg-amber-50";
  }
}

export async function closeScanner() {
  if (_scanner && _isRunning) {
    try {
      await _scanner.stop();
    } catch { /* ignore */ }
    _isRunning = false;
  }

  if (_scanner) {
    try { _scanner.clear(); } catch { /* ignore */ }
    _scanner = null;
  }

  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  _onScanCallback = null;
}
