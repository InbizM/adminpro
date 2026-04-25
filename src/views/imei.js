import { getEquipos, crearEquipo, actualizarEquipo, eliminarEquipo } from "../api.js";
import { showToast } from "../toast.js";
import { openScanner } from "../scanner.js";

let _equipos = [];
let _isLoaded = false;
let _isProcessing = false;

// Elements
let elTable, elSearch, elFilter, elBtnNew;
let elModal, elModalClose, elModalBackdrop, elForm, elBtnSave;
let elImei1, elImei2, elNombre, elMarca, elProv, elCosto, elVenta, elEstado, elOriginal;

export function initIMEI() {
  return async () => {
    bindElements();
    
    if (!_isLoaded) {
      await loadData();
      setupEvents();
      _isLoaded = true;
    }
    
    renderTable(_equipos);
  };
}

function bindElements() {
  elTable = document.getElementById("imei-table-body");
  elSearch = document.getElementById("imei-search");
  elFilter = document.getElementById("imei-filter-status");
  elBtnNew = document.getElementById("imei-new-btn");

  elModal = document.getElementById("imei-modal");
  elModalClose = document.getElementById("imei-modal-close");
  elModalBackdrop = document.getElementById("imei-modal-backdrop");
  elForm = document.getElementById("imei-form");
  elBtnSave = document.getElementById("imei-save-btn");

  elImei1 = document.getElementById("imei-1");
  elImei2 = document.getElementById("imei-2");
  elNombre = document.getElementById("imei-nombre");
  elMarca = document.getElementById("imei-marca");
  elProv = document.getElementById("imei-proveedor");
  elCosto = document.getElementById("imei-costo");
  elVenta = document.getElementById("imei-venta");
  elEstado = document.getElementById("imei-estado");
  elOriginal = document.getElementById("imei-original");
}

async function loadData() {
  try {
    elTable.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando equipos...</td></tr>`;
    _equipos = await getEquipos();
  } catch (err) {
    showToast("Error cargando equipos: " + err.message, "error");
    _equipos = [];
  }
}

function renderTable(lista) {
  if (lista.length === 0) {
    elTable.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron equipos</td></tr>`;
    return;
  }

  elTable.innerHTML = lista.map(e => {
    const isVendido = e.estado === "Vendido";
    const statusColor = e.estado === "Disponible" ? "bg-green-100 text-green-800" 
                      : e.estado === "Vendido" ? "bg-red-100 text-red-800" 
                      : "bg-yellow-100 text-yellow-800";
    
    return `
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3">
          <div class="font-mono text-xs font-bold text-on-surface">${e.imei1 || '-'}</div>
          ${e.imei2 ? `<div class="font-mono text-[10px] text-on-surface-variant">${e.imei2}</div>` : ''}
        </td>
        <td class="px-4 py-3">
          <p class="font-bold text-sm text-on-surface">${e.nombre || '-'}</p>
          <p class="text-[11px] text-on-surface-variant">${e.marca || 'N/A'}</p>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColor}">
            ${e.estado || 'Desconocido'}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${e.proveedor || '-'}</td>
        <td class="px-4 py-3">
          <p class="text-xs font-medium text-on-surface-variant line-through">$${new Intl.NumberFormat("es-CO").format(e.costo || 0)}</p>
          <p class="text-sm font-bold text-primary">$${new Intl.NumberFormat("es-CO").format(e.venta || 0)}</p>
        </td>
        <td class="px-4 py-3 text-right">
          <button onclick="window.imeiEdit('${e.imei1}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onclick="window.imeiDelete('${e.imei1}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
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
    
    const filtered = _equipos.filter(e => {
      const matchQ = (e.imei1 || "").toLowerCase().includes(q) ||
                     (e.imei2 || "").toLowerCase().includes(q) ||
                     (e.nombre || "").toLowerCase().includes(q);
      const matchS = st ? e.estado === st : true;
      return matchQ && matchS;
    });
    renderTable(filtered);
  };

  elSearch.addEventListener("input", filterData);
  elFilter.addEventListener("change", filterData);

  // Scanner for search
  document.getElementById("imei-scan-btn")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear IMEI",
      onScan: (code) => {
        elSearch.value = code;
        filterData();
        showToast(`IMEI: ${code}`, "info");
      }
    });
  });

  // Scanner for IMEI 1 field inside modal
  document.getElementById("imei-scan-1")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear IMEI 1",
      onScan: (code) => {
        elImei1.value = code;
        showToast(`IMEI 1: ${code}`, "success");
      }
    });
  });

  // Scanner for IMEI 2 field inside modal
  document.getElementById("imei-scan-2")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear IMEI 2",
      onScan: (code) => {
        elImei2.value = code;
        showToast(`IMEI 2: ${code}`, "success");
      }
    });
  });

  elBtnNew.addEventListener("click", () => openModal(null));
  elModalClose.addEventListener("click", closeModal);
  elModalBackdrop.addEventListener("click", closeModal);
  
  elBtnSave.addEventListener("click", saveEquipo);

  window.imeiEdit = (imei) => {
    const eq = _equipos.find(e => e.imei1 == imei);
    if (eq) openModal(eq);
  };

  window.imeiDelete = async (imei) => {
    if (!confirm(`¿Eliminar el equipo con IMEI ${imei}?`)) return;
    try {
      showToast("Eliminando...", "info");
      const res = await eliminarEquipo(imei);
      if (res && res.success) {
        showToast("Equipo eliminado", "success");
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

function openModal(eq) {
  elForm.reset();
  if (eq) {
    elOriginal.value = eq.imei1;
    elImei1.value = eq.imei1;
    elImei2.value = eq.imei2 || "";
    elNombre.value = eq.nombre || "";
    elMarca.value = eq.marca || "";
    elProv.value = eq.proveedor || "";
    elCosto.value = eq.costo || "";
    elVenta.value = eq.venta || "";
    elEstado.value = eq.estado || "Disponible";
    document.getElementById("imei-modal-title").textContent = "Editar Equipo";
  } else {
    elOriginal.value = "";
    elEstado.value = "Disponible";
    document.getElementById("imei-modal-title").textContent = "Registrar Equipo";
  }
  
  elModal.classList.remove("hidden");
  elModal.classList.add("flex");
}

function closeModal() {
  elModal.classList.add("hidden");
  elModal.classList.remove("flex");
}

async function saveEquipo() {
  if (!elForm.checkValidity()) {
    elForm.reportValidity();
    return;
  }
  
  if (_isProcessing) return;
  _isProcessing = true;
  elBtnSave.textContent = "Guardando...";
  elBtnSave.disabled = true;

  try {
    const idOrig = elOriginal.value;
    const datos = {
      imei1: elImei1.value.trim(),
      imei2: elImei2.value.trim(),
      nombre: elNombre.value.trim(),
      marca: elMarca.value.trim(),
      proveedor: elProv.value.trim(),
      costo: parseInt(elCosto.value) || 0,
      venta: parseInt(elVenta.value) || 0,
      estado: elEstado.value
    };

    let res;
    if (idOrig) {
      res = await actualizarEquipo(idOrig, datos);
    } else {
      res = await crearEquipo(datos);
    }

    if (res && res.success) {
      showToast("Equipo guardado", "success");
      closeModal();
      await loadData();
      renderTable(_equipos);
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
