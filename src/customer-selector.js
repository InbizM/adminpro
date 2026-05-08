/**
 * customer-selector.js — Universal Customer Selector Modal
 * Reusable across POS, Credits, Technical Service, etc.
 */
import { getClientes, crearCliente } from "./api.js";
import { showToast } from "./toast.js";

let _clientes = [];
let _isLoaded = false;
let _onSelectCallback = null;

// DOM refs
let modal, backdrop, closeBtn, searchInput, scanBtn, newBtn, resultsList, newFormContainer;

export async function initCustomerSelector() {
  ensureDOM();
  if (!_isLoaded) {
    try {
      _clientes = await getClientes();
      _isLoaded = true;
    } catch (e) {
      console.error("Error loading clients for selector", e);
    }
  }
}

function ensureDOM() {
  if (document.getElementById("customer-selector-modal")) return;

  const html = `
    <div id="customer-selector-modal" class="hidden fixed inset-0 z-[70] items-center justify-center p-4">
      <div id="cs-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-surface-container-lowest border-b border-surface-variant shrink-0">
          <h3 class="font-bold text-lg text-on-surface">Seleccionar Cliente</h3>
          <button id="cs-close" class="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <!-- Search Area -->
        <div id="cs-search-area" class="p-4 border-b border-surface-variant shrink-0">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input id="cs-search" type="text" placeholder="Buscar documento, nombre..." autocomplete="off"
                class="w-full bg-surface-container-low border border-surface-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" />
            </div>
            <button id="cs-new-btn" title="Nuevo Cliente" class="px-3 bg-primary text-on-primary rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </div>
        </div>

        <!-- New Client Form (Hidden by default) -->
        <div id="cs-new-form-area" class="hidden p-4 border-b border-surface-variant bg-surface-container-lowest shrink-0">
          <p class="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Crear Cliente Rápido</p>
          <div class="space-y-3">
             <div>
                <input id="cs-new-doc" type="text" placeholder="Documento *" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div>
                <input id="cs-new-nom" type="text" placeholder="Nombre completo *" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div class="grid grid-cols-2 gap-2">
                <input id="cs-new-tel" type="text" placeholder="Teléfono" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                <input id="cs-new-email" type="email" placeholder="Email" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div>
                <input id="cs-new-dir" type="text" placeholder="Dirección" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div class="flex gap-2">
                <select id="cs-new-tipo" class="flex-1 bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Mayorista">Mayorista</option>
                </select>
                <button id="cs-save-new" class="px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container whitespace-nowrap">Guardar</button>
                <button id="cs-cancel-new" class="px-3 bg-surface-variant text-on-surface text-sm rounded-lg hover:bg-surface-container-high">x</button>
             </div>
          </div>
        </div>

        <!-- Results List -->
        <div class="flex-1 overflow-y-auto p-2 bg-surface-container-lowest">
          <ul id="cs-results" class="divide-y divide-surface-variant">
            <li class="p-4 text-center text-sm text-on-surface-variant">Escribe para buscar o crea uno nuevo</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  modal = document.getElementById("customer-selector-modal");
  backdrop = document.getElementById("cs-backdrop");
  closeBtn = document.getElementById("cs-close");
  searchInput = document.getElementById("cs-search");
  newBtn = document.getElementById("cs-new-btn");
  resultsList = document.getElementById("cs-results");
  newFormContainer = document.getElementById("cs-new-form-area");

  // Events
  closeBtn.addEventListener("click", closeSelector);
  backdrop.addEventListener("click", closeSelector);
  
  searchInput.addEventListener("input", handleSearch);

  newBtn.addEventListener("click", () => {
    newFormContainer.classList.toggle("hidden");
    document.getElementById("cs-new-doc").focus();
  });

  document.getElementById("cs-cancel-new").addEventListener("click", () => {
    newFormContainer.classList.add("hidden");
  });

  document.getElementById("cs-save-new").addEventListener("click", async () => {
    const doc = document.getElementById("cs-new-doc").value.trim();
    const nom = document.getElementById("cs-new-nom").value.trim();
    const tel = document.getElementById("cs-new-tel").value.trim();
    const email = document.getElementById("cs-new-email").value.trim();
    const dir = document.getElementById("cs-new-dir").value.trim();
    const tipo = document.getElementById("cs-new-tipo").value;
    
    if (!doc || !nom) {
      showToast("Documento y Nombre son obligatorios", "warning");
      return;
    }

    const btn = document.getElementById("cs-save-new");
    btn.disabled = true;
    btn.textContent = "...";

    try {
      const res = await crearCliente({ documento: doc, cedula: doc, nombre: nom, telefono: tel, direccion: dir, email: email, tipo: tipo });
      if (res && res.success) {
        showToast("Cliente creado", "success");
        // Update local list
        const newClient = { cedula: doc, documento: doc, nombre: nom, telefono: tel, direccion: dir, email: email, tipo: tipo, id: doc };
        _clientes.push(newClient);
        
        // Hide form and select it
        newFormContainer.classList.add("hidden");
        document.getElementById("cs-new-doc").value = "";
        document.getElementById("cs-new-nom").value = "";
        document.getElementById("cs-new-tel").value = "";
        document.getElementById("cs-new-email").value = "";
        document.getElementById("cs-new-dir").value = "";
        document.getElementById("cs-new-tipo").value = "General";
        
        selectClient(newClient);
      } else {
        showToast(res.mensaje || "Error al crear", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
}

function handleSearch() {
  const term = searchInput.value.toLowerCase().trim();
  if (!term) {
    resultsList.innerHTML = `<li class="p-4 text-center text-sm text-on-surface-variant">Escribe para buscar...</li>`;
    return;
  }

  const filtered = _clientes.filter(c => {
    const doc = c.cedula || c.documento || "";
    return doc.toLowerCase().includes(term) ||
           (c.nombre && c.nombre.toLowerCase().includes(term)) ||
           (c.telefono && c.telefono.toLowerCase().includes(term));
  }).slice(0, 20); // max 20 results for performance

  renderResults(filtered);
}

function renderResults(list) {
  if (list.length === 0) {
    resultsList.innerHTML = `<li class="p-4 text-center text-sm text-on-surface-variant">No se encontraron clientes.</li>`;
    return;
  }

  resultsList.innerHTML = list.map(c => {
    const doc = c.cedula || c.documento || "";
    return `
    <li>
      <button type="button" class="cs-item-btn w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex flex-col focus:bg-surface-container-low outline-none" data-doc="${doc}">
        <span class="font-bold text-sm text-on-surface">${c.nombre}</span>
        <span class="text-[11px] text-on-surface-variant mt-0.5">C.C: ${doc} ${c.telefono ? '• Tel: ' + c.telefono : ''}</span>
      </button>
    </li>
  `;
  }).join("");

  document.querySelectorAll(".cs-item-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const doc = btn.dataset.doc;
      const client = _clientes.find(c => (c.cedula || c.documento || "") === doc);
      if (client) {
        // Ensure "documento" exists for the views that expect it
        client.documento = doc;
        selectClient(client);
      }
    });
  });
}

function selectClient(client) {
  if (_onSelectCallback) {
    _onSelectCallback(client);
  }
  closeSelector();
}

/**
 * Opens the universal customer selector.
 * @param {Function} onSelect Callback function receiving the selected client object.
 */
export async function openCustomerSelector(onSelect) {
  await initCustomerSelector(); // ensure data is loaded
  _onSelectCallback = onSelect;
  searchInput.value = "";
  
  // Show recent clients immediately
  if (_clientes.length > 0) {
    // Show the last 20 clients added (assuming they are at the end, or just slice)
    const recent = [..._clientes].reverse().slice(0, 20);
    renderResults(recent);
  } else {
    resultsList.innerHTML = `<li class="p-4 text-center text-sm text-on-surface-variant">No hay clientes. Crea uno nuevo.</li>`;
  }
  
  newFormContainer.classList.add("hidden");
  
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  
  setTimeout(() => searchInput.focus(), 100);
}

function closeSelector() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  _onSelectCallback = null;
}
