import { getCreditos, actualizarCredito } from "../api.js";
import { showToast } from "../toast.js";

let _creditos = [];
let _isLoaded = false;
let _isProcessing = false;

// Elements
let elTable, elSearch, elFilter;
let elStatTotal, elStatRecaudo;
let elModal, elModalClose, elModalBackdrop, elForm, elBtnSave;
let elCredId, elCredCliente, elCredSaldo, elMontoAbono;

export function initCredits() {
  return async () => {
    bindElements();
    
    if (!_isLoaded) {
      await loadData();
      setupEvents();
      _isLoaded = true;
    }
    
    renderTable(_creditos);
  };
}

function bindElements() {
  elTable = document.getElementById("cred-table-body");
  elSearch = document.getElementById("cred-search");
  elFilter = document.getElementById("cred-filter-status");
  
  elStatTotal = document.getElementById("cred-stat-total");
  elStatRecaudo = document.getElementById("cred-stat-recaudo");

  elModal = document.getElementById("cred-modal");
  elModalClose = document.getElementById("cred-modal-close");
  elModalBackdrop = document.getElementById("cred-modal-backdrop");
  elForm = document.getElementById("cred-form");
  elBtnSave = document.getElementById("cred-save-btn");

  elCredId = document.getElementById("cred-id");
  elCredCliente = document.getElementById("cred-cliente-name");
  elCredSaldo = document.getElementById("cred-saldo-actual");
  elMontoAbono = document.getElementById("cred-monto-abono");
}

async function loadData() {
  try {
    elTable.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-on-surface-variant">Cargando créditos...</td></tr>`;
    _creditos = await getCreditos();
  } catch (err) {
    showToast("Error cargando créditos: " + err.message, "error");
    _creditos = [];
  }
}

function updateStats(lista) {
  let totalDeuda = 0;
  let totalRecaudado = 0;
  
  lista.forEach(c => {
    if (c.estado !== 'Cancelado') {
      totalDeuda += (c.saldo || 0);
    }
    totalRecaudado += (c.abonado || 0);
  });
  
  elStatTotal.textContent = `$${new Intl.NumberFormat("es-CO").format(totalDeuda)}`;
  elStatRecaudo.textContent = `$${new Intl.NumberFormat("es-CO").format(totalRecaudado)}`;
}

function renderTable(lista) {
  updateStats(_creditos); // Always use full list for stats or filtered list? Usually filtered list is better for context
  
  if (lista.length === 0) {
    elTable.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-on-surface-variant">No se encontraron créditos</td></tr>`;
    return;
  }

  elTable.innerHTML = lista.map(c => {
    const isCancelado = c.estado === "Cancelado";
    const statusColor = isCancelado ? "bg-green-100 text-green-800" 
                      : c.estado === "En Mora" ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800";
    
    return `
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3">
          <p class="font-bold text-sm text-on-surface">${c.cliente || '-'}</p>
          <p class="text-[11px] text-on-surface-variant">${c.telefono || ''}</p>
        </td>
        <td class="px-4 py-3 font-mono text-xs text-on-surface-variant">${c.idFactura || '-'}</td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${c.fecha || '-'}</td>
        <td class="px-4 py-3 text-sm font-medium text-on-surface">$${new Intl.NumberFormat("es-CO").format(c.total || 0)}</td>
        <td class="px-4 py-3 text-sm font-medium text-green-600">$${new Intl.NumberFormat("es-CO").format(c.abonado || 0)}</td>
        <td class="px-4 py-3 text-sm font-black text-error">$${new Intl.NumberFormat("es-CO").format(c.saldo || 0)}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColor}">
            ${c.estado || 'Activo'}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          ${!isCancelado ? `
            <button onclick="window.credAddAbono('${c.id}')" class="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg text-xs font-bold transition-colors">
              Abonar
            </button>
          ` : `<span class="text-xs text-on-surface-variant font-medium">Pagado</span>`}
        </td>
      </tr>
    `;
  }).join("");
}

function setupEvents() {
  const filterData = () => {
    const q = elSearch.value.toLowerCase().trim();
    const st = elFilter.value;
    
    const filtered = _creditos.filter(c => {
      const matchQ = (c.cliente || "").toLowerCase().includes(q) ||
                     (c.idFactura || "").toLowerCase().includes(q);
      const matchS = st ? c.estado === st : true;
      return matchQ && matchS;
    });
    renderTable(filtered);
    updateStats(filtered);
  };

  elSearch.addEventListener("input", filterData);
  elFilter.addEventListener("change", filterData);

  elModalClose.addEventListener("click", closeModal);
  elModalBackdrop.addEventListener("click", closeModal);
  elBtnSave.addEventListener("click", saveAbono);

  window.credAddAbono = (id) => {
    const cred = _creditos.find(c => c.id == id);
    if (cred) openModal(cred);
  };
}

function openModal(cred) {
  elForm.reset();
  elCredId.value = cred.id;
  elCredCliente.textContent = cred.cliente;
  elCredSaldo.textContent = `$${new Intl.NumberFormat("es-CO").format(cred.saldo || 0)}`;
  elMontoAbono.max = cred.saldo; // Can't pay more than the debt
  
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
    const id = elCredId.value;
    const monto = parseInt(elMontoAbono.value);
    
    // In actual implementation we need to get the specific credit and calculate new balance.
    // The backend `actualizarCredito` or a specialized `registrarAbono` should handle this.
    // For now we assume we send the abono amount to an endpoint, or we calculate it here and send full update.
    
    const cred = _creditos.find(c => c.id == id);
    const nuevoAbonado = (cred.abonado || 0) + monto;
    const nuevoSaldo = (cred.total || 0) - nuevoAbonado;
    const nuevoEstado = nuevoSaldo <= 0 ? "Cancelado" : "Activo";

    const datos = {
      abonado: nuevoAbonado,
      saldo: Math.max(0, nuevoSaldo),
      estado: nuevoEstado,
      detalleUltimoPago: `Abono de $${monto} el ${new Date().toLocaleDateString()}`
    };

    const res = await actualizarCredito(id, datos);

    if (res && res.success) {
      showToast("Abono registrado", "success");
      closeModal();
      await loadData();
      renderTable(_creditos);
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
