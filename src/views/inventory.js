import { getInventario, crearProducto, actualizarProducto, eliminarProducto, uploadFoto } from "../api.js";
import { showToast } from "../toast.js";

let productos = [];
let filteredProductos = [];
let editingId = null;

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
  const badge = stockBadge(p.stockActual, p.stockMinimo);
  const catCls = CATEGORIA_COLORS[p.categoria] || "text-secondary bg-surface-variant";
  const isOut  = Number(p.stockActual) === 0;
  const precio = Number(String(p.precioVenta).replace(/\D/g, "")).toLocaleString("es-CO");

  return `
    <div data-id="${p.id}" class="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden
         group hover:shadow-[0_12px_24px_rgba(189,0,48,0.08)] hover:border-outline-variant
         transition-all duration-300 flex flex-col relative ${isOut ? "opacity-75 grayscale hover:grayscale-0 hover:opacity-100" : ""}">
      <!-- Status badge -->
      <div class="absolute top-3 right-3 z-10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
           border backdrop-blur-sm ${badge.cls}">${badge.label}</div>
      <!-- Image -->
      <div class="h-44 bg-surface-container flex items-center justify-center p-5 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-surface-container-high to-surface-container-lowest opacity-50"></div>
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" class="h-full w-full object-contain relative z-10 mix-blend-multiply drop-shadow-md transition-transform duration-500 group-hover:scale-105">`
          : `<span class="material-symbols-outlined text-5xl text-on-surface-variant/30 relative z-10">inventory_2</span>`}
      </div>
      <!-- Content -->
      <div class="p-4 flex flex-col flex-1">
        <div class="flex justify-between items-start mb-1">
          <span class="text-[11px] font-medium tracking-widest text-secondary">${p.sku || p.id}</span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-sm ${catCls}">${p.categoria}</span>
        </div>
        <h3 class="font-semibold text-[17px] text-on-surface leading-tight mt-1 mb-1">${p.nombre}</h3>
        <span class="text-xs text-on-surface-variant mb-3">${p.marca}</span>
        <div class="mt-auto grid grid-cols-2 gap-3 border-t border-surface-variant pt-3 mb-4">
          <div>
            <p class="text-[11px] text-on-surface-variant mb-0.5">Precio venta</p>
            <p class="font-semibold text-base text-on-surface">$${precio}</p>
          </div>
          <div>
            <p class="text-[11px] text-on-surface-variant mb-0.5">Tipo</p>
            <p class="font-semibold text-base text-on-surface">${p.tipo || "—"}</p>
          </div>
        </div>
        <!-- Actions -->
        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onclick="inventoryView.openEdit('${p.id}')"
            class="flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-md
                   hover:bg-primary-container transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[15px]">edit</span> Editar
          </button>
          <button onclick="inventoryView.deleteProduct('${p.id}')"
            class="px-3 py-2 bg-surface text-secondary border border-surface-variant rounded-md
                   hover:bg-error-container hover:text-error hover:border-error-container
                   transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-[15px]">delete</span>
          </button>
        </div>
      </div>
    </div>`;
}

function renderGrid() {
  const grid = document.getElementById("inv-grid");
  if (!grid) return;
  grid.innerHTML = filteredProductos.length
    ? filteredProductos.map(cardHtml).join("")
    : `<div class="col-span-full text-center py-20 text-on-surface-variant">
         <span class="material-symbols-outlined text-5xl">search_off</span>
         <p class="mt-2 font-semibold">No hay productos que coincidan.</p>
       </div>`;

  // Update stats
  const totalEl = document.getElementById("inv-stat-total");
  const alertEl = document.getElementById("inv-stat-alert");
  if (totalEl) totalEl.textContent = productos.length.toLocaleString();
  if (alertEl) alertEl.textContent = productos.filter(p => Number(p.stockActual) <= Number(p.stockMinimo)).length;
}

function applyFilter() {
  const q = (document.getElementById("inv-search")?.value || "").toLowerCase();
  const cat = document.getElementById("inv-filter-cat")?.value || "";
  filteredProductos = productos.filter(p =>
    (!q || [p.nombre, p.marca, p.sku, p.id].some(v => String(v).toLowerCase().includes(q))) &&
    (!cat || p.categoria === cat)
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
    if (res.success) { closeModal(); await loadInventario(); }
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">save</span> Guardar`;
  }
}

// ---- Public interface (called from HTML onclick) ----
window.inventoryView = {
  openEdit(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById("inv-id").value = p.id;
    document.getElementById("inv-nombre").value = p.nombre;
    document.getElementById("inv-marca").value = p.marca;
    document.getElementById("inv-categoria").value = p.categoria;
    document.getElementById("inv-tipo").value = p.tipo || "";
    document.getElementById("inv-costo").value = p.costo;
    document.getElementById("inv-venta").value = p.precioVenta;
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
  if (!sel) return;
  const cats = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  sel.innerHTML = `<option value="">Todas las categorías</option>` +
    cats.map(c => `<option value="${c}">${c}</option>`).join("");
}

export function initInventory() {
  // Search
  document.getElementById("inv-search")?.addEventListener("input", applyFilter);
  document.getElementById("inv-filter-cat")?.addEventListener("change", applyFilter);

  // FAB and open new modal
  document.getElementById("inv-new-btn")?.addEventListener("click", () => {
    editingId = null;
    document.getElementById("inv-form")?.reset();
    document.getElementById("inv-existing-img").value = "";
    document.getElementById("inv-img-preview").innerHTML =
      `<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">add_photo_alternate</span>`;
    openModal("Nuevo Producto");
  });

  // Close modal
  document.getElementById("inv-modal-close")?.addEventListener("click", closeModal);
  document.getElementById("inv-modal-backdrop")?.addEventListener("click", closeModal);

  // Image preview
  document.getElementById("inv-img-file")?.addEventListener("change", previewImg);

  // Save
  document.getElementById("inv-save-btn")?.addEventListener("click", saveProduct);

  return loadInventario;
}
