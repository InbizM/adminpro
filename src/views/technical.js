import { getServicioTecnico, crearServicioTecnico, actualizarServicioTecnico, eliminarServicioTecnico } from "../api.js";
import { showToast } from "../toast.js";
import { openScanner } from "../scanner.js";

let _techs = [];
let _isLoaded = false;
let _isProcessing = false;

// Elements
let elGrid, elSearch, elFilter, elBtnNew;
let elModal, elModalClose, elModalBackdrop, elForm, elBtnSave;
let elId, elCliente, elEquipo, elFalla, elCosto, elEstado;

export function initTechnical() {
  return async () => {
    bindElements();
    
    if (!_isLoaded) {
      await loadData();
      setupEvents();
      _isLoaded = true;
    }
    
    renderGrid(_techs);
  };
}

function bindElements() {
  elGrid = document.getElementById("tech-grid");
  elSearch = document.getElementById("tech-search");
  elFilter = document.getElementById("tech-filter-status");
  elBtnNew = document.getElementById("tech-new-btn");

  elModal = document.getElementById("tech-modal");
  elModalClose = document.getElementById("tech-modal-close");
  elModalBackdrop = document.getElementById("tech-modal-backdrop");
  elForm = document.getElementById("tech-form");
  elBtnSave = document.getElementById("tech-save-btn");

  elId = document.getElementById("tech-id");
  elCliente = document.getElementById("tech-cliente");
  elEquipo = document.getElementById("tech-equipo");
  elFalla = document.getElementById("tech-falla");
  elCosto = document.getElementById("tech-costo");
  elEstado = document.getElementById("tech-estado");
}

async function loadData() {
  try {
    elGrid.innerHTML = `<p class="col-span-full p-4 text-center text-on-surface-variant">Cargando servicios técnicos...</p>`;
    _techs = await getServicioTecnico();
  } catch (err) {
    showToast("Error cargando servicio técnico: " + err.message, "error");
    _techs = [];
  }
}

function renderGrid(lista) {
  if (lista.length === 0) {
    elGrid.innerHTML = `<p class="col-span-full p-4 text-center text-on-surface-variant">No se encontraron registros</p>`;
    return;
  }

  elGrid.innerHTML = lista.map(t => {
    const isEntregado = t.estado === "Entregado";
    const statusColor = isEntregado ? "bg-green-100 text-green-800" 
                      : t.estado === "Reparado" ? "bg-blue-100 text-blue-800"
                      : t.estado === "En Revisión" ? "bg-orange-100 text-orange-800"
                      : t.estado === "Sin Arreglo" ? "bg-red-100 text-red-800"
                      : "bg-surface-container text-on-surface-variant";
    
    return `
      <div class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-colors">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-bold text-on-surface leading-tight">${t.cliente || 'Desconocido'}</p>
            <p class="text-[11px] text-on-surface-variant mt-0.5 font-mono">ID: ${t.id || '-'}</p>
          </div>
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${statusColor}">
            ${t.estado || 'Ingresado'}
          </span>
        </div>
        
        <div class="mt-1">
          <p class="text-xs font-bold text-on-surface flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">smartphone</span> ${t.equipo || '-'}</p>
          <p class="text-[11px] text-on-surface-variant mt-1 line-clamp-2" title="${t.falla}">${t.falla || 'Sin detalles'}</p>
        </div>
        
        <div class="mt-auto pt-3 border-t border-surface-variant flex justify-between items-center">
          <div>
            <p class="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mb-0.5">Costo Aprox.</p>
            <p class="text-sm font-black text-primary">$${new Intl.NumberFormat("es-CO").format(t.costo || 0)}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="window.techEdit('${t.id}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
              <span class="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button onclick="window.techDelete('${t.id}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function setupEvents() {
  const filterData = () => {
    const q = elSearch.value.toLowerCase().trim();
    const st = elFilter.value;
    
    const filtered = _techs.filter(t => {
      const matchQ = (t.cliente || "").toLowerCase().includes(q) ||
                     (t.equipo || "").toLowerCase().includes(q) ||
                     (t.id || "").toLowerCase().includes(q);
      const matchS = st ? t.estado === st : true;
      return matchQ && matchS;
    });
    renderGrid(filtered);
  };

  elSearch.addEventListener("input", filterData);
  elFilter.addEventListener("change", filterData);

  // Scanner for search
  document.getElementById("tech-scan-btn")?.addEventListener("click", () => {
    openScanner({
      title: "Buscar Equipo",
      onScan: (code) => {
        elSearch.value = code;
        filterData();
        showToast(`Buscando: ${code}`, "info");
      }
    });
  });

  // Scanner for Equipo field in modal
  document.getElementById("tech-scan-equipo")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear Equipo / IMEI",
      onScan: (code) => {
        elEquipo.value = code;
        showToast(`Equipo: ${code}`, "success");
      }
    });
  });

  elBtnNew.addEventListener("click", () => openModal(null));
  elModalClose.addEventListener("click", closeModal);
  elModalBackdrop.addEventListener("click", closeModal);
  elBtnSave.addEventListener("click", saveTechnical);

  window.techEdit = (id) => {
    const t = _techs.find(x => x.id == id);
    if (t) openModal(t);
  };

  window.techDelete = async (id) => {
    if (!confirm(`¿Eliminar el registro de servicio técnico ${id}?`)) return;
    try {
      showToast("Eliminando...", "info");
      const res = await eliminarServicioTecnico(id);
      if (res && res.success) {
        showToast("Registro eliminado", "success");
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

function openModal(t) {
  elForm.reset();
  if (t) {
    elId.value = t.id;
    elCliente.value = t.cliente || "";
    elEquipo.value = t.equipo || "";
    elFalla.value = t.falla || "";
    elCosto.value = t.costo || 0;
    elEstado.value = t.estado || "Ingresado";
    document.getElementById("tech-modal-title").textContent = "Editar Ingreso";
  } else {
    elId.value = "";
    elEstado.value = "Ingresado";
    document.getElementById("tech-modal-title").textContent = "Nuevo Ingreso a Servicio";
  }
  
  elModal.classList.remove("hidden");
  elModal.classList.add("flex");
}

function closeModal() {
  elModal.classList.add("hidden");
  elModal.classList.remove("flex");
}

async function saveTechnical() {
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
      equipo: elEquipo.value.trim(),
      falla: elFalla.value.trim(),
      costo: parseInt(elCosto.value) || 0,
      estado: elEstado.value
    };

    let res;
    if (idOrig) {
      res = await actualizarServicioTecnico(idOrig, datos);
    } else {
      res = await crearServicioTecnico(datos);
    }

    if (res && res.success) {
      showToast("Servicio técnico guardado", "success");
      closeModal();
      await loadData();
      renderGrid(_techs);
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
