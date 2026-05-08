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
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

let _scanner = null;
let _isRunning = false;
let _onScanCallback = null;
let _facingMode = "environment";
let _torchOn = false;

// DOM refs (created once)
let modal, backdrop, closeBtn, readerEl, statusEl, titleEl, manualInput, manualBtn, torchBtn, switchBtn, guideBox;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) { /* ignore if audio not supported */ }
}

function ensureDOM() {
  const oldModal = document.getElementById("scanner-modal");
  if (oldModal) {
    if (document.getElementById("scanner-guide-box")) return; // Ya es la nueva versión
    oldModal.remove(); // Eliminar versión vieja
  }

  const html = `
    <div id="scanner-modal" class="hidden fixed inset-0 z-[60] items-center justify-center p-4">
      <div id="scanner-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 flex flex-col max-h-[95vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-surface-variant flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings:'FILL' 1">qr_code_scanner</span>
            <h3 id="scanner-title" class="font-bold text-on-surface text-sm">Escanear Código</h3>
          </div>
          <button id="scanner-close" class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <!-- Camera viewer -->
        <div class="bg-black relative touch-none flex-1 min-h-[300px]">
          <div id="scanner-reader" class="w-full h-full object-cover"></div>
          
          <!-- Custom Draggable Guide Overlay -->
          <div class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none">
            <div id="scanner-guide-box" class="border-2 border-white/60 relative flex-shrink-0 transition-none" style="width: 250px; height: 150px; box-shadow: 0 0 0 4000px rgba(0,0,0,0.65);">
              <!-- 4 Corners (pointer-events-auto) -->
              <div data-dir="tl" class="resize-handle absolute -top-1.5 -left-1.5 w-8 h-8 border-t-4 border-l-4 border-white pointer-events-auto cursor-nwse-resize"></div>
              <div data-dir="tr" class="resize-handle absolute -top-1.5 -right-1.5 w-8 h-8 border-t-4 border-r-4 border-white pointer-events-auto cursor-nesw-resize"></div>
              <div data-dir="bl" class="resize-handle absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-4 border-l-4 border-white pointer-events-auto cursor-nesw-resize"></div>
              <div data-dir="br" class="resize-handle absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-4 border-r-4 border-white pointer-events-auto cursor-nwse-resize"></div>
            </div>
          </div>

          <!-- Floating Controls -->
          <div class="absolute bottom-4 right-4 flex gap-2 z-20 pointer-events-auto">
            <button id="scanner-torch-btn" class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform" title="Linterna">
              <span class="material-symbols-outlined text-[20px]">flashlight_on</span>
            </button>
            <button id="scanner-switch-btn" class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform" title="Cambiar cámara">
              <span class="material-symbols-outlined text-[20px]">cameraswitch</span>
            </button>
          </div>
        </div>

        <!-- Status -->
        <div id="scanner-status" class="px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low flex-shrink-0">
          Iniciando cámara...
        </div>
        
        <!-- Manual input fallback -->
        <div class="px-5 py-4 border-t border-surface-variant flex-shrink-0">
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
  torchBtn = document.getElementById("scanner-torch-btn");
  switchBtn = document.getElementById("scanner-switch-btn");
  guideBox = document.getElementById("scanner-guide-box");

  // Events
  closeBtn.addEventListener("click", closeScanner);
  backdrop.addEventListener("click", closeScanner);
  manualBtn.addEventListener("click", handleManualInput);
  manualInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleManualInput();
  });
  
  torchBtn.addEventListener("click", toggleTorch);
  switchBtn.addEventListener("click", switchCamera);

  initResizeHandles();
}

function initResizeHandles() {
  const handles = document.querySelectorAll(".resize-handle");
  let activeHandle = null;
  let startX, startY, startW, startH;

  handles.forEach(h => {
    h.addEventListener("touchstart", (e) => {
      activeHandle = h;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startW = guideBox.offsetWidth;
      startH = guideBox.offsetHeight;
      e.preventDefault();
    }, {passive: false});
    
    // Fallback for mouse
    h.addEventListener("mousedown", (e) => {
      activeHandle = h;
      startX = e.clientX;
      startY = e.clientY;
      startW = guideBox.offsetWidth;
      startH = guideBox.offsetHeight;
      e.preventDefault();
    });
  });

  const onMove = (clientX, clientY, e) => {
    if (!activeHandle) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    let newW = startW;
    let newH = startH;
    const dir = activeHandle.dataset.dir;

    if (dir === "br") {
      newW = startW + dx * 2;
      newH = startH + dy * 2;
    } else if (dir === "bl") {
      newW = startW - dx * 2;
      newH = startH + dy * 2;
    } else if (dir === "tr") {
      newW = startW + dx * 2;
      newH = startH - dy * 2;
    } else if (dir === "tl") {
      newW = startW - dx * 2;
      newH = startH - dy * 2;
    }

    newW = Math.max(80, Math.min(newW, window.innerWidth - 30));
    newH = Math.max(80, Math.min(newH, 400));

    guideBox.style.width = newW + "px";
    guideBox.style.height = newH + "px";
    if (e) e.preventDefault();
  };

  document.addEventListener("touchmove", (e) => {
    if (activeHandle) onMove(e.touches[0].clientX, e.touches[0].clientY, e);
  }, {passive: false});

  document.addEventListener("mousemove", (e) => {
    if (activeHandle) onMove(e.clientX, e.clientY, e);
  });

  const onEnd = () => { activeHandle = null; };
  document.addEventListener("touchend", onEnd);
  document.addEventListener("mouseup", onEnd);
}

function handleManualInput() {
  const code = manualInput.value.trim();
  if (!code) return;
  if (_onScanCallback) _onScanCallback(code);
  closeScanner();
}

async function toggleTorch() {
  if (!_scanner || !_isRunning) return;
  _torchOn = !_torchOn;
  try {
    await _scanner.applyVideoConstraints({ advanced: [{ torch: _torchOn }] });
    torchBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${_torchOn ? 'flashlight_off' : 'flashlight_on'}</span>`;
    if (_torchOn) {
      torchBtn.classList.replace("bg-black/50", "bg-primary");
    } else {
      torchBtn.classList.replace("bg-primary", "bg-black/50");
    }
  } catch (e) {
    console.error("Torch not supported", e);
    _torchOn = false;
  }
}

async function switchCamera() {
  if (!_scanner || !_isRunning) return;
  _facingMode = _facingMode === "environment" ? "user" : "environment";
  statusEl.textContent = "Cambiando cámara...";
  
  try {
    await _scanner.stop();
  } catch (e) {}
  
  _torchOn = false;
  torchBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">flashlight_on</span>`;
  torchBtn.classList.remove("bg-primary");
  torchBtn.classList.add("bg-black/50");

  _isRunning = false;
  await startScannerFeed();
}

async function startScannerFeed() {
  try {
    _isRunning = true;
    await _scanner.start(
      { facingMode: _facingMode },
      {
        fps: 20,
        // Eliminamos qrbox interno para escanear todo, el guideBox es solo visual
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.PDF_417
        ]
      },
      (decodedText) => {
        playBeep();
        statusEl.textContent = `✅ Detectado: ${decodedText}`;
        statusEl.className = "px-5 py-3 text-center text-sm text-green-800 bg-green-50 font-bold";
        
        if (_onScanCallback) _onScanCallback(decodedText);
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

export async function openScanner({ title = "Escanear Código", onScan } = {}) {
  ensureDOM();
  _onScanCallback = onScan;
  _facingMode = "environment";
  _torchOn = false;

  titleEl.textContent = title;
  manualInput.value = "";
  statusEl.textContent = "Iniciando cámara...";
  statusEl.className = "px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low";
  
  if (torchBtn) {
    torchBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">flashlight_on</span>`;
    torchBtn.classList.remove("bg-primary");
    torchBtn.classList.add("bg-black/50");
  }

  // Restaurar tamaño visual por defecto (rectángulo panorámico)
  if (guideBox) {
    guideBox.style.width = "280px";
    guideBox.style.height = "120px";
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  await new Promise(r => setTimeout(r, 300));

  if (!_scanner) {
    _scanner = new Html5Qrcode("scanner-reader");
  }

  await startScannerFeed();
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
