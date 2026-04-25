import { getPedidos, crearPedido, actualizarPedido, eliminarPedido } from "../api.js";
import { showToast } from "../toast.js";

let _pedidos = [];
let _isLoaded = false;
let _isProcessing = false;

// Elements
let elTable, elSearch, elFilter, elBtnNew;
let elModal, elModalClose, elModalBackdrop, elForm, elBtnSave;
let elId, elCliente, elProducto, elCosto, elAbono, elEstado;

export function initPedidos() {
  return async () => {
    bindElements();
    
    if (!_isLoaded) {
      await loadData();
      setupEvents();
      _isLoaded = true;
    }
    
    renderTable(_pedidos);
  };
}

function bindElements() {
  elTable = document.getElementById("ped-table-body");
  elSearch = document.getElementById("ped-search");
  elFilter = document.getElementById("ped-filter-status");
  elBtnNew = document.getElementById("ped-new-btn");

  elModal = document.getElementById("ped-modal");
  elModalClose = document.getElementById("ped-modal-close");
  elModalBackdrop = document.getElementById("ped-modal-backdrop");
  elForm = document.getElementById("ped-form");
  elBtnSave = document.getElementById("ped-save-btn");

  elId = document.getElementById("ped-id");
  elCliente = document.getElementById("ped-cliente");
  elProducto = document.getElementById("ped-producto");
  elCosto = document.getElementById("ped-costo");
  elAbono = document.getElementById("ped-abono");
  elEstado = document.getElementById("ped-estado");
}

async function loadData() {
  try {
    elTable.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando pedidos...</td></tr>`;
    _pedidos = await getPedidos();
  } catch (err) {
    showToast("Error cargando pedidos: " + err.message, "error");
    _pedidos = [];
  }
}

function renderTable(lista) {
  if (lista.length === 0) {
    elTable.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron pedidos</td></tr>`;
    return;
  }

  elTable.innerHTML = lista.map(p => {
    const isEntregado = p.estado === "Entregado al Cliente";
    const statusColor = isEntregado ? "bg-green-100 text-green-800" 
                      : p.estado === "Recibido" ? "bg-blue-100 text-blue-800"
                      : p.estado === "En Tránsito" ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800";
    
    return `
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3">
          <div class="font-mono text-xs font-bold text-on-surface">${p.id || '-'}</div>
          <div class="text-[10px] text-on-surface-variant">${p.fecha || ''}</div>
        </td>
        <td class="px-4 py-3 font-bold text-sm text-on-surface">${p.cliente || '-'}</td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${p.producto || '-'}</td>
        <td class="px-4 py-3">
          <p class="text-xs text-on-surface-variant font-medium">Costo: $${new Intl.NumberFormat("es-CO").format(p.costoAprox || 0)}</p>
          <p class="text-sm font-bold text-primary">Abono: $${new Intl.NumberFormat("es-CO").format(p.abono || 0)}</p>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColor}">
            ${p.estado || 'Pendiente'}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="window.pedEdit('${p.id}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="window.pedDelete('${p.id}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function setupEvents() {
  const filterData = () => {
    const q = elSearch.value.toLowerCase().trim();
    const st = elFilter.value;
    
    const filtered = _pedidos.filter(p => {
      const matchQ = (p.cliente || "").toLowerCase().includes(q) ||
                     (p.producto || "").toLowerCase().includes(q) ||
                     (p.id || "").toLowerCase().includes(q);
      const matchS = st ? p.estado === st : true;
      return matchQ && matchS;
    });
    renderTable(filtered);
  };

  elSearch.addEventListener("input", filterData);
  elFilter.addEventListener("change", filterData);

  elBtnNew.addEventListener("click", () => openModal(null));
  elModalClose.addEventListener("click", closeModal);
  elModalBackdrop.addEventListener("click", closeModal);
  elBtnSave.addEventListener("click", savePedido);

  window.pedEdit = (id) => {
    const ped = _pedidos.find(p => p.id == id);
    if (ped) openModal(ped);
  };

  window.pedDelete = async (id) => {
    if (!confirm(`¿Eliminar el pedido ${id}?`)) return;
    try {
      showToast("Eliminando...", "info");
      const res = await eliminarPedido(id);
      if (res && res.success) {
        showToast("Pedido eliminado", "success");
        await loadData();
        filterData();
      } else {
        showToast(res.mensaje || "Error al eliminar", "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };
}

function openModal(ped) {
  elForm.reset();
  if (ped) {
    elId.value = ped.id;
    elCliente.value = ped.cliente || "";
    elProducto.value = ped.producto || "";
    elCosto.value = ped.costoAprox || 0;
    elAbono.value = ped.abono || 0;
    elEstado.value = ped.estado || "Pendiente";
    document.getElementById("ped-modal-title").textContent = "Editar Pedido";
  } else {
    elId.value = "";
    elEstado.value = "Pendiente";
    document.getElementById("ped-modal-title").textContent = "Nuevo Pedido";
  }
  
  elModal.classList.remove("hidden");
  elModal.classList.add("flex");
}

function closeModal() {
  elModal.classList.add("hidden");
  elModal.classList.remove("flex");
}

async function savePedido() {
  if (!elForm.checkValidity()) {
    elForm.reportValidity();
    return;
  }
  
  if (_isProcessing) return;
  _isProcessing = true;
  elBtnSave.textContent = "Guardando...";
  elBtnSave.disabled = true;

  try {
    const idOrig = elId.value;
    const datos = {
      cliente: elCliente.value.trim(),
      producto: elProducto.value.trim(),
      costoAprox: parseInt(elCosto.value) || 0,
      abono: parseInt(elAbono.value) || 0,
      estado: elEstado.value
    };

    let res;
    if (idOrig) {
      res = await actualizarPedido(idOrig, datos);
    } else {
      res = await crearPedido(datos);
    }

    if (res && res.success) {
      showToast("Pedido guardado", "success");
      closeModal();
      await loadData();
      renderTable(_pedidos);
    } else {
      showToast(res?.mensaje || "Error al guardar", "error");
    }
  } catch (err) {
    showToast("Error de conexión: " + err.message, "error");
  } finally {
    _isProcessing = false;
    elBtnSave.innerHTML = `<span class="material-symbols-outlined text-[18px]">save</span> Guardar`;
    elBtnSave.disabled = false;
  }
}
