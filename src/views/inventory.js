import { getInventario, crearProducto, actualizarProducto, eliminarProducto, uploadFoto } from "../api.js";
import { showToast } from "../toast.js";
import { openScanner } from "../scanner.js";

let productos = [];
let filteredProductos = [];
let editingId = null;
let _viewMode = 'grid';

const CATEGORIA_COLORS = {
  Celular: "text-tertiary bg-tertiary-fixed/60",
  Accesorio: "text-secondary bg-surface-variant",
  Audio: "text-purple-700 bg-purple-100",
  Tablet: "text-indigo-700 bg-indigo-100",
};

function stockBadge(actual, minimo) {
  const n = Number(actual);
  const m = Number(minimo);
  if (n === 0) return { label: "Sin Stock", cls: "bg-red-100 text-red-800 border-red-200", icon: "block" };
  if (n <= m)  return { label: `Bajo: ${n}`, cls: "bg-amber-100 text-amber-800 border-amber-200", icon: "warning" };
  return       { label: `OK: ${n}`,    cls: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "check_circle" };
}

function cardHtml(p) {
  const badge = stockBadge(p.stock_actual, p.stock_minimo);
  const catCls = CATEGORIA_COLORS[p.categoria] || "text-secondary bg-surface-variant";
  const isOut  = Number(p.stock_actual) === 0;
  const isReventa = (p.tipo || '').toLowerCase() === 'reventa';
  const precio = Number(String(p.precio_venta || 0).replace(/\D/g, "")).toLocaleString("es-CO");
  const costo  = Number(String(p.costo || 0).replace(/\D/g, "")).toLocaleString("es-CO");

  return `
    <div data-id="${p.id}" onclick="inventoryView.openDetail('${p.id}')" class="bg-surface-container-lowest border ${isReventa ? 'border-indigo-200' : 'border-surface-variant'} rounded-xl overflow-hidden
         group hover:shadow-[0_12px_24px_rgba(189,0,48,0.08)] hover:border-outline-variant
         transition-all duration-300 flex flex-col relative cursor-pointer ${isOut ? "opacity-75" : ""}"
    >
      <!-- Status badge -->
      <div class="absolute top-3 right-3 z-10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
           border backdrop-blur-sm ${badge.cls}">${badge.label}</div>
      ${isReventa ? `<div class="absolute top-3 left-3 z-10 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">🔄 Reventa</div>` : ''}
      <!-- Image -->
      <div class="h-36 bg-surface-container flex items-center justify-center p-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-surface-container-high to-surface-container-lowest opacity-50"></div>
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" referrerpolicy="no-referrer" class="h-full w-full object-contain relative z-10 drop-shadow-md">`
          : `<span class="material-symbols-outlined text-5xl text-on-surface-variant/30 relative z-10">inventory_2</span>`}
      </div>
      <!-- Content -->
      <div class="p-3 flex flex-col flex-1">
        <div class="flex justify-between items-start mb-1">
          <span class="text-[10px] font-medium tracking-widest text-secondary">${p.sku || p.id}</span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ${catCls}">${p.categoria}</span>
        </div>
        <h3 class="font-semibold text-sm text-on-surface leading-tight mt-1 mb-0.5">${p.nombre}</h3>
        <span class="text-[11px] text-on-surface-variant mb-2">${p.marca || '—'}</span>
        <div class="mt-auto grid grid-cols-3 gap-1 border-t border-surface-variant pt-2 mb-2">
          <div>
            <p class="text-[9px] text-on-surface-variant mb-0">Costo</p>
            <p class="font-medium text-xs text-on-surface-variant">$${costo}</p>
          </div>
          <div>
            <p class="text-[9px] text-on-surface-variant mb-0">Venta</p>
            <p class="font-semibold text-xs text-on-surface">$${precio}</p>
          </div>
          <div>
            <p class="text-[9px] text-on-surface-variant mb-0">Stock</p>
            <p class="font-bold text-xs text-on-surface">${p.stock_actual ?? '—'}</p>
          </div>
        </div>
        ${p.ubicacion ? `<p class="text-[10px] text-on-surface-variant truncate"><span class="material-symbols-outlined text-[11px] align-middle">location_on</span> ${p.ubicacion}</p>` : ''}
        <!-- Actions -->
        <div class="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onclick="event.stopPropagation(); inventoryView.openEdit('${p.id}')"
            class="flex-1 px-2 py-1.5 bg-surface text-primary border border-surface-variant rounded-md
                   hover:bg-primary/10 transition-colors flex items-center justify-center gap-1 text-xs font-medium">
            <span class="material-symbols-outlined text-[14px]">edit</span> Editar
          </button>
          <button onclick="event.stopPropagation(); inventoryView.deleteProduct('${p.id}')"
            class="px-2 py-1.5 bg-surface text-on-surface-variant border border-surface-variant rounded-md
                   hover:bg-error-container hover:text-error hover:border-error-container
                   transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>
    </div>`;
}

function renderGrid() {
  const grid = document.getElementById("inv-grid");
  const tableWrap = document.getElementById("inv-table-wrapper");
  const tableBody = document.getElementById("inv-table-body");
  if (!grid) return;

  const user = JSON.parse(localStorage.getItem("adminpro_user") || "{}");
  const isAdmin = user.rol === "Administrador";

  if (_viewMode === 'grid') {
    tableWrap.classList.add('hidden');
    grid.classList.remove('hidden');
    grid.innerHTML = filteredProductos.length
      ? filteredProductos.map(p => {
          const badge = stockBadge(p.stockActual, p.stockMinimo);
          const isOut = Number(p.stockActual) === 0;
          const precio = Number(String(p.precioVenta).replace(/\D/g, "")).toLocaleString("es-CO");
          return `
            <div onclick="inventoryView.openDetail('${p.id}')" class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer ${isOut ? 'opacity-70 grayscale-[0.5]' : ''}">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                  ${p.imagen ? `<img src="${p.imagen}" class="w-full h-full object-cover">` : `<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">image</span>`}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="font-bold text-on-surface text-sm truncate" title="${p.nombre}">${p.nombre}</h3>
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border whitespace-nowrap ${badge.cls}">${badge.label}</span>
                  </div>
                  <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">${p.marca || '-'}</p>
                  <p class="font-mono text-xs font-bold text-on-surface-variant/70 mb-2 truncate" title="${p.sku || p.id}">${p.sku || p.id}</p>
                </div>
              </div>
              <div class="flex items-end justify-between mt-auto pt-3 border-t border-surface-variant/50">
                <div>
                  <p class="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-0.5">Precio Venta</p>
                  <p class="font-black text-primary text-lg leading-none">$${precio}</p>
                </div>
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${isAdmin ? `<button onclick="event.stopPropagation(); inventoryView.openEdit('${p.id}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-primary hover:bg-primary/10 transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>` : ''}
                  ${isAdmin ? `<button onclick="event.stopPropagation(); inventoryView.deleteProduct('${p.id}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-error hover:bg-error/10 transition-colors" title="Eliminar">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join("")
      : `<div class="col-span-full text-center py-20 text-on-surface-variant">
           <span class="material-symbols-outlined text-5xl">search_off</span>
           <p class="mt-2 font-semibold">No hay productos que coincidan.</p>
         </div>`;
  } else {
    grid.classList.add('hidden');
    tableWrap.classList.remove('hidden');
    tableBody.innerHTML = filteredProductos.length
      ? filteredProductos.map(p => {
          const badge = stockBadge(p.stockActual, p.stockMinimo);
          const isOut = Number(p.stockActual) === 0;
          const precio = Number(String(p.precioVenta).replace(/\D/g, "")).toLocaleString("es-CO");
          const costo  = Number(String(p.costo || 0).replace(/\D/g, "")).toLocaleString("es-CO");
          return `
            <tr onclick="inventoryView.openDetail('${p.id}')" class="hover:bg-surface-container-low transition-colors cursor-pointer ${isOut ? 'opacity-70' : ''}">
              <td class="px-4 py-3">
                ${p.imagen ? `<img src="${p.imagen}" class="w-8 h-8 rounded object-cover">` : `<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center"><span class="material-symbols-outlined text-[16px] text-on-surface-variant/50">inventory_2</span></div>`}
              </td>
              <td class="px-4 py-3">
                <p class="font-bold text-sm text-on-surface">${p.nombre}</p>
                <p class="text-[10px] text-on-surface-variant">${p.marca || '-'}</p>
              </td>
              <td class="px-4 py-3 font-mono text-xs font-bold text-on-surface-variant">${p.sku || p.id}</td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">${p.categoria}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${badge.cls}">${badge.label}</span>
              </td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">$${costo}</td>
              <td class="px-4 py-3 font-bold text-primary">$${precio}</td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">${p.ubicacion || '—'}</td>
              <td class="px-4 py-3 text-right">
                ${isAdmin ? `<button onclick="event.stopPropagation(); inventoryView.openEdit('${p.id}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>` : ''}
                ${isAdmin ? `<button onclick="event.stopPropagation(); inventoryView.deleteProduct('${p.id}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>` : ''}
              </td>
            </tr>
          `;
        }).join("")
      : `<tr><td colspan="6" class="text-center py-10 text-on-surface-variant">No hay productos</td></tr>`;
  }

  // Update stats
  const totalEl = document.getElementById("inv-stat-total");
  const alertEl = document.getElementById("inv-stat-alert");
  if (totalEl) totalEl.textContent = productos.length.toLocaleString();
  if (alertEl) alertEl.textContent = productos.filter(p => Number(p.stockActual) <= Number(p.stockMinimo)).length;
}

function applyFilter() {
  const q = (document.getElementById("inv-search")?.value || "").toLowerCase();
  const cat = document.getElementById("inv-filter-cat")?.value || "";
  const tipo = document.getElementById("inv-filter-tipo")?.value || "";
  filteredProductos = productos.filter(p =>
    (!q || [p.nombre, p.marca, p.sku, p.id].some(v => String(v).toLowerCase().includes(q))) &&
    (!cat || p.categoria === cat) &&
    (!tipo || (p.tipo || '') === tipo)
  );
  renderGrid();
}

// ---- Modal ----
function openModal(title) {
  document.getElementById("inv-modal-title").textContent = title;
  document.getElementById("inv-modal").classList.remove("hidden");
  document.getElementById("inv-modal").classList.add("flex");
}

function closeModal() {
  document.getElementById("inv-modal").classList.add("hidden");
  document.getElementById("inv-modal").classList.remove("flex");
  editingId = null;
  window.__posReventaMode = false;
  document.getElementById("inv-form").reset();
  document.getElementById("inv-img-preview").innerHTML =
    `<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">add_photo_alternate</span>`;
}

function previewImg(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("inv-img-preview").innerHTML =
      `<img src="${ev.target.result}" class="w-full h-full object-cover">`;
  };
  reader.readAsDataURL(file);
}

async function saveProduct() {
  const btn = document.getElementById("inv-save-btn");
  btn.disabled = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Guardando...`;

  try {
    let imagenUrl = document.getElementById("inv-existing-img").value;
    const fileInput = document.getElementById("inv-img-file");

    if (fileInput.files[0]) {
      const file = fileInput.files[0];
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Subiendo foto...`;
      const reader = new FileReader();
      imagenUrl = await new Promise((resolve, reject) => {
        reader.onload = async (ev) => {
          try {
            const res = await uploadFoto(ev.target.result, file.name, file.type);
            resolve(res.url || res);
          } catch (err) { reject(err); }
        };
        reader.readAsDataURL(file);
      });
    }

    const datos = [
      document.getElementById("inv-id").value,
      document.getElementById("inv-nombre").value,
      document.getElementById("inv-marca").value,
      document.getElementById("inv-categoria").value,
      document.getElementById("inv-tipo").value,
      document.getElementById("inv-costo").value.replace(/\D/g, ""),
      document.getElementById("inv-venta").value.replace(/\D/g, ""),
      document.getElementById("inv-stock-min").value,
      document.getElementById("inv-stock-act").value,
      document.getElementById("inv-ubicacion").value,
      document.getElementById("inv-sku").value,
      imagenUrl,
    ];

    let res;
    if (editingId) {
      res = await actualizarProducto(editingId, datos);
    } else {
      res = await crearProducto(datos);
    }

    showToast(res.mensaje || "Guardado correctamente", res.success ? "success" : "error");
    if (res.success) {
      // If this was opened from POS as a Reventa, add product to the cart
      if (window.__posReventaMode && !editingId) {
        const product = {
          id: datos[0],
          nombre: datos[1],
          marca: datos[2],
          categoria: datos[3],
          costo: datos[5],
          precioVenta: datos[6],
        };
        if (typeof window.__posAddReventaToCart === "function") {
          window.__posAddReventaToCart(product);
        }
        window.__posReventaMode = false;
      }
      closeModal();
      await loadInventario();
    }
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">save</span> Guardar`;
  }
}

// ---- Public interface (called from HTML onclick) ----
let _detailId = null;

window.inventoryView = {
  openDetail(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;
    _detailId = id;
    const fmt = v => Number(String(v || 0).replace(/\D/g, "")||0).toLocaleString("es-CO");
    // Populate detail modal
    document.getElementById("inv-d-nombre").textContent    = p.nombre || '—';
    document.getElementById("inv-d-marca").textContent     = p.marca || '—';
    document.getElementById("inv-d-cat").textContent       = p.categoria || '—';
    document.getElementById("inv-d-costo").textContent     = `$${fmt(p.costo)}`;
    document.getElementById("inv-d-venta").textContent     = `$${fmt(p.precioVenta)}`;
    document.getElementById("inv-d-stock").textContent     = p.stockActual ?? '—';
    document.getElementById("inv-d-stockmin").textContent  = p.stockMinimo ?? '—';
    document.getElementById("inv-d-tipo").textContent      = p.tipo || '—';
    document.getElementById("inv-d-ubicacion").textContent = p.ubicacion || '—';
    document.getElementById("inv-d-sku").textContent       = p.sku || p.id || '—';
    const imgWrap = document.getElementById("inv-detail-img-wrap");
    const img = document.getElementById("inv-detail-img");
    if (p.imagen) { img.src = p.imagen; imgWrap.classList.remove("hidden"); }
    else { imgWrap.classList.add("hidden"); }
    const dm = document.getElementById("inv-detail-modal");
    dm.classList.remove("hidden"); dm.classList.add("flex");
  },
  openEdit(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    // Close detail modal if open
    const dm = document.getElementById("inv-detail-modal");
    dm.classList.add("hidden"); dm.classList.remove("flex");
    document.getElementById("inv-id").value = p.id;
    document.getElementById("inv-nombre").value = p.nombre;
    document.getElementById("inv-marca").value = p.marca;
    document.getElementById("inv-categoria").value = p.categoria;
    document.getElementById("inv-tipo").value = p.tipo || "Físico";
    document.getElementById("inv-costo").value = p.costo ? new Intl.NumberFormat("es-CO").format(p.costo) : "";
    document.getElementById("inv-venta").value = p.precioVenta ? new Intl.NumberFormat("es-CO").format(p.precioVenta) : "";
    document.getElementById("inv-stock-min").value = p.stockMinimo;
    document.getElementById("inv-stock-act").value = p.stockActual;
    document.getElementById("inv-ubicacion").value = p.ubicacion;
    document.getElementById("inv-sku").value = p.sku;
    document.getElementById("inv-existing-img").value = p.imagen || "";
    if (p.imagen) {
      document.getElementById("inv-img-preview").innerHTML =
        `<img src="${p.imagen}" class="w-full h-full object-cover">`;
    }
    openModal("Editar Producto");
  },
  async deleteProduct(id) {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await eliminarProducto(id);
      showToast(res.mensaje || "Eliminado", res.success ? "success" : "error");
      if (res.success) await loadInventario();
    } catch (err) { showToast("Error: " + err.message, "error"); }
  },
  openNuevo(isReventa = false) {
    editingId = null;
    document.getElementById("inv-form")?.reset();
    document.getElementById("inv-tipo").value = isReventa ? "Reventa" : "Físico";
    document.getElementById("inv-existing-img").value = "";
    document.getElementById("inv-img-preview").innerHTML =
      `<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">add_photo_alternate</span>`;
    
    if (isReventa) {
      document.getElementById("inv-id").value = "REV-" + Date.now().toString().slice(-6);
    }
    
    openModal(isReventa ? "Nueva Reventa" : "Nuevo Producto");
  }
};

async function loadInventario() {
  const grid = document.getElementById("inv-grid");
  if (grid) grid.innerHTML = `<div class="col-span-full flex justify-center py-20">
    <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>`;
  try {
    productos = await getInventario();
    filteredProductos = [...productos];
    renderGrid();
    populateCategoryFilter();
  } catch (err) {
    if (grid) grid.innerHTML = `<div class="col-span-full text-center py-20 text-error font-semibold">
      <span class="material-symbols-outlined text-4xl">wifi_off</span>
      <p class="mt-2">Error al cargar: ${err.message}</p></div>`;
  }
}

function populateCategoryFilter() {
  const sel = document.getElementById("inv-filter-cat");
  const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  if (sel) {
    sel.innerHTML = `<option value="">Todas las categorías</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join("");
  }
  
  // Populate datalists
  const datalistCats = document.getElementById("datalist-categorias");
  if (datalistCats) {
    datalistCats.innerHTML = cats.map(c => `<option value="${c}">`).join("");
  }
  
  const datalistMarcas = document.getElementById("datalist-marcas");
  if (datalistMarcas) {
    const marcas = [...new Set(productos.map(p => p.marca).filter(Boolean))];
    datalistMarcas.innerHTML = marcas.map(m => `<option value="${m}">`).join("");
  }
}

function formatNumberInput(e) {
  let val = e.target.value.replace(/\D/g, "");
  if (!val) {
    e.target.value = "";
    return;
  }
  e.target.value = new Intl.NumberFormat("es-CO").format(parseInt(val, 10));
}

export function initInventory() {
  // Physical Barcode Scanner Integration
  document.addEventListener("barcodeScanned", (e) => {
    // Verificar si estamos en la vista de inventario
    const invView = document.querySelector('[data-view="inventory"]');
    if (!invView || invView.classList.contains('hidden')) return;

    const code = e.detail;

    // Si el modal de Nuevo/Editar Producto está abierto, pon el código en el campo SKU
    const modal = document.getElementById("inv-modal");
    if (modal && !modal.classList.contains('hidden')) {
      const skuInput = document.getElementById("inv-sku");
      if (skuInput) {
        skuInput.value = code;
        showToast(`SKU ingresado: ${code}`, "success");
      }
      return;
    }

    // De lo contrario, buscar en el inventario general
    const searchInput = document.getElementById("inv-search");
    if (searchInput) {
      searchInput.value = code;
      applyFilter();
      
      // Si hay exactamente un resultado, abrir su detalle automáticamente
      if (filteredProductos.length === 1) {
        inventoryView.openDetail(filteredProductos[0].id);
        showToast("Producto encontrado", "success");
      } else if (filteredProductos.length === 0) {
        showToast("No se encontró el producto", "warning");
      }
    }
  });

  // Search
  document.getElementById("inv-search")?.addEventListener("input", applyFilter);
  document.getElementById("inv-filter-cat")?.addEventListener("change", applyFilter);
  document.getElementById("inv-filter-tipo")?.addEventListener("change", applyFilter);

  // View Toggle
  document.getElementById("inv-view-toggle")?.addEventListener("click", () => {
    _viewMode = _viewMode === 'grid' ? 'table' : 'grid';
    const icon = document.getElementById("inv-view-toggle").querySelector("span");
    icon.textContent = _viewMode === 'grid' ? "view_list" : "grid_view";
    renderGrid();
  });

  // Auto-ID
  document.getElementById("inv-auto-id-btn")?.addEventListener("click", () => {
    document.getElementById("inv-id").value = "PROD-" + Date.now().toString().slice(-6);
  });

  // FAB and open new modal
  document.getElementById("inv-new-btn")?.addEventListener("click", () => {
    if (window.inventoryView && window.inventoryView.openNuevo) {
      window.inventoryView.openNuevo(false);
    }
  });

  // Number formatters
  document.getElementById("inv-costo")?.addEventListener("input", formatNumberInput);
  document.getElementById("inv-venta")?.addEventListener("input", formatNumberInput);

  // Close modal
  document.getElementById("inv-modal-close")?.addEventListener("click", closeModal);
  document.getElementById("inv-modal-backdrop")?.addEventListener("click", closeModal);

  // Image preview
  document.getElementById("inv-img-file")?.addEventListener("change", previewImg);

  // Save
  document.getElementById("inv-save-btn")?.addEventListener("click", saveProduct);

  // Scanner
  document.getElementById("inv-scan-sku")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear SKU / Barcode",
      onScan: (code) => {
        document.getElementById("inv-sku").value = code;
        showToast(`SKU Detectado: ${code}`, "success");
      }
    });
  });

  // Add Brand / Category via inline mini-modal
  let _qiTarget = null; // 'marca' or 'cat'
  const qiModal  = document.getElementById("inv-quick-input-modal");
  const qiTitle  = document.getElementById("inv-qi-title");
  const qiInput  = document.getElementById("inv-qi-input");
  const qiSave   = document.getElementById("inv-qi-save");
  const qiCancel = document.getElementById("inv-qi-cancel");
  const qiBackdrop = document.getElementById("inv-qi-backdrop");

  function openQI(type) {
    _qiTarget = type;
    qiTitle.textContent = type === 'marca' ? 'Nueva Marca' : 'Nueva Categoría';
    qiInput.value = "";
    qiModal.classList.remove("hidden"); qiModal.classList.add("flex");
    setTimeout(() => qiInput.focus(), 50);
  }
  function closeQI() { qiModal.classList.add("hidden"); qiModal.classList.remove("flex"); }

  qiCancel.addEventListener("click", closeQI);
  qiBackdrop.addEventListener("click", closeQI);
  qiInput.addEventListener("keydown", e => { if (e.key === "Enter") qiSave.click(); });

  qiSave.addEventListener("click", () => {
    const val = qiInput.value.trim();
    if (!val) return;
    if (_qiTarget === 'marca') {
      const dl = document.getElementById("datalist-marcas");
      if (![...dl.options].some(o => o.value.toLowerCase() === val.toLowerCase())) {
        const opt = document.createElement("option"); opt.value = val; dl.appendChild(opt);
      }
      document.getElementById("inv-marca").value = val;
      showToast(`Marca "${val}" agregada`, "success");
    } else {
      const dl = document.getElementById("datalist-categorias");
      const sel = document.getElementById("inv-filter-cat");
      if (![...dl.options].some(o => o.value.toLowerCase() === val.toLowerCase())) {
        const opt = document.createElement("option"); opt.value = val; dl.appendChild(opt);
        if (sel) { const so = document.createElement("option"); so.value = val; so.textContent = val; sel.appendChild(so); }
      }
      document.getElementById("inv-categoria").value = val;
      showToast(`Categoría "${val}" agregada`, "success");
    }
    closeQI();
  });

  document.getElementById("inv-add-marca-btn")?.addEventListener("click", () => openQI('marca'));
  document.getElementById("inv-add-cat-btn")?.addEventListener("click", () => openQI('cat'));

  // Detail modal close + Edit button
  const closeDetail = () => {
    const dm = document.getElementById("inv-detail-modal");
    dm.classList.add("hidden"); dm.classList.remove("flex");
  };
  document.getElementById("inv-detail-close")?.addEventListener("click", closeDetail);
  document.getElementById("inv-detail-close2")?.addEventListener("click", closeDetail);
  document.getElementById("inv-detail-backdrop")?.addEventListener("click", closeDetail);
  document.getElementById("inv-detail-edit-btn")?.addEventListener("click", () => {
    if (_detailId) inventoryView.openEdit(_detailId);
  });

  return loadInventario;
}
