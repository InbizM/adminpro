import { getSepare, abonarSepare } from "../api.js";
import { showToast } from "../toast.js";

let _separes = [];
let _isLoaded = false;
let _isProcessing = false;

// Elements
let elGrid, elSearch, elFilter;
let elModal, elModalClose, elModalBackdrop, elForm, elBtnSave;
let elSepId, elSepCliente, elSepProducto, elSepSaldo, elMontoAbono;

export function initSepare() {
  return async () => {
    bindElements();
    
    if (!_isLoaded) {
      await loadData();
      setupEvents();
      _isLoaded = true;
    }
    
    renderGrid(_separes);
  };
}

function bindElements() {
  elGrid = document.getElementById("sep-grid");
  elSearch = document.getElementById("sep-search");
  elFilter = document.getElementById("sep-filter-status");

  elModal = document.getElementById("sep-modal");
  elModalClose = document.getElementById("sep-modal-close");
  elModalBackdrop = document.getElementById("sep-modal-backdrop");
  elForm = document.getElementById("sep-form");
  elBtnSave = document.getElementById("sep-save-btn");

  elSepId = document.getElementById("sep-id");
  elSepCliente = document.getElementById("sep-cliente-name");
  elSepProducto = document.getElementById("sep-producto-name");
  elSepSaldo = document.getElementById("sep-saldo-actual");
  elMontoAbono = document.getElementById("sep-monto-abono");
}

async function loadData() {
  try {
    elGrid.innerHTML = `<p class="col-span-full p-4 text-center text-on-surface-variant">Cargando separaciones...</p>`;
    _separes = await getSepare();
  } catch (err) {
    showToast("Error cargando Plan Separe: " + err.message, "error");
    _separes = [];
  }
}

function renderGrid(lista) {
  if (lista.length === 0) {
    elGrid.innerHTML = `<p class="col-span-full p-4 text-center text-on-surface-variant">No se encontraron registros</p>`;
    return;
  }

  elGrid.innerHTML = lista.map(s => {
    const isEntregado = s.estado === "Entregado";
    const isVencido = s.estado === "Vencido";
    const statusColor = isEntregado ? "bg-green-100 text-green-800" 
                      : isVencido ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800";
    
    const fmtTotal = new Intl.NumberFormat("es-CO").format(s.total || 0);
    const fmtSaldo = new Intl.NumberFormat("es-CO").format(s.saldo || 0);
    
    // Percentage for progress bar
    const abonado = (s.total || 0) - (s.saldo || 0);
    const perc = s.total ? Math.min(100, Math.max(0, (abonado / s.total) * 100)) : 0;
    
    return `
      <div class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-surface-container">
          <div class="h-full bg-primary transition-all duration-500" style="width: ${perc}%"></div>
        </div>
        
        <div class="flex justify-between items-start mt-1">
          <div>
            <p class="font-bold text-on-surface leading-tight">${s.cliente}</p>
            <p class="text-xs text-on-surface-variant mt-0.5"><span class="material-symbols-outlined text-[14px] align-middle">phone_iphone</span> ${s.producto}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColor}">
            ${s.estado || 'Separado'}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-surface-variant/50">
          <div>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Total</p>
            <p class="text-sm font-medium text-on-surface">$${fmtTotal}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Saldo</p>
            <p class="text-sm font-black text-error">$${fmtSaldo}</p>
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-2">
          <p class="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">event</span> Límite: <strong class="${isVencido ? 'text-error' : ''}">${s.fechaLimite || '-'}</strong>
          </p>
          
          ${!isEntregado && (s.saldo || 0) > 0 ? `
            <button onclick="window.sepAddAbono('${s.idSepare}')" class="px-3 py-1.5 bg-surface-container-low text-primary hover:bg-primary/10 border border-surface-variant rounded-lg text-xs font-bold transition-colors shadow-sm">
              Abonar
            </button>
          ` : `<span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Pagado</span>`}
        </div>
      </div>
    `;
  }).join("");
}

function setupEvents() {
  const filterData = () => {
    const q = elSearch.value.toLowerCase().trim();
    const st = elFilter.value;
    
    const filtered = _separes.filter(s => {
      const matchQ = (s.cliente || "").toLowerCase().includes(q) ||
                     (s.producto || "").toLowerCase().includes(q) ||
                     (s.idSepare || "").toLowerCase().includes(q);
      const matchS = st ? s.estado === st : true;
      return matchQ && matchS;
    });
    renderGrid(filtered);
  };

  elSearch.addEventListener("input", filterData);
  elFilter.addEventListener("change", filterData);

  elModalClose.addEventListener("click", closeModal);
  elModalBackdrop.addEventListener("click", closeModal);
  elBtnSave.addEventListener("click", saveAbono);

  window.sepAddAbono = (id) => {
    const sep = _separes.find(s => s.idSepare == id);
    if (sep) openModal(sep);
  };
}

function openModal(sep) {
  elForm.reset();
  elSepId.value = sep.idSepare;
  elSepCliente.textContent = sep.cliente;
  elSepProducto.textContent = sep.producto;
  elSepSaldo.textContent = `$${new Intl.NumberFormat("es-CO").format(sep.saldo || 0)}`;
  elMontoAbono.max = sep.saldo; // Can't pay more than the debt
  
  elModal.classList.remove("hidden");
  elModal.classList.add("flex");
  elMontoAbono.focus();
}

function closeModal() {
  elModal.classList.add("hidden");
  elModal.classList.remove("flex");
}

async function saveAbono() {
  if (!elForm.checkValidity()) {
    elForm.reportValidity();
    return;
  }
  
  if (_isProcessing) return;
  _isProcessing = true;
  elBtnSave.textContent = "Aplicando...";
  elBtnSave.disabled = true;

  try {
    const id = elSepId.value;
    const monto = parseInt(elMontoAbono.value);
    
    // Asumimos firma opcional por ahora
    const firma = ""; 
    const res = await abonarSepare(id, monto, firma);

    if (res && res.success) {
      showToast("Abono registrado", "success");
      closeModal();
      await loadData();
      renderGrid(_separes);
    } else {
      showToast(res?.mensaje || "Error al guardar el abono", "error");
    }
  } catch (err) {
    showToast("Error de conexión: " + err.message, "error");
  } finally {
    _isProcessing = false;
    elBtnSave.textContent = "Aplicar Abono";
    elBtnSave.disabled = false;
  }
}
