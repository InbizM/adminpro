import { getVentas } from "../api.js";
import { showToast } from "../toast.js";

let _ventas = [];
let _filteredVentas = [];

export function initSalesHistory() {
  return async () => {
    // Configurar búsqueda
    const searchInput = document.getElementById("sales-search");
    searchInput?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      _filteredVentas = _ventas.filter(v => 
        (v.id_factura || "").toLowerCase().includes(q) ||
        (v.cliente || "").toLowerCase().includes(q) ||
        (v.cedula || "").toLowerCase().includes(q)
      );
      renderTable();
    });

    // Configurar cierre de modal
    const closeModal = () => {
      const modal = document.getElementById("sale-detail-modal");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };
    document.getElementById("sale-detail-close")?.addEventListener("click", closeModal);
    document.getElementById("sale-detail-backdrop")?.addEventListener("click", closeModal);

    await loadSalesHistory();
  };
}

async function loadSalesHistory() {
  const container = document.getElementById("sales-history-list");
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">Cargando todas las ventas...</td></tr>`;
    _ventas = await getVentas();
    _filteredVentas = [..._ventas];
    renderTable();
  } catch (err) {
    container.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-error italic text-sm">Error: ${err.message}</td></tr>`;
  }
}

function renderTable() {
  const container = document.getElementById("sales-history-list");
  if (!container) return;

  if (_filteredVentas.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">No se encontraron ventas</td></tr>`;
    return;
  }

  container.innerHTML = _filteredVentas.map((v, i) => {
    const fecha = new Date(v.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    const total = new Intl.NumberFormat("es-CO").format(v.total || 0);

    return `
      <tr class="hover:bg-surface-container-low transition-colors text-[13px]">
        <td class="px-4 py-4 text-center text-on-surface-variant font-medium">${i + 1}</td>
        <td class="px-4 py-4">
          <div class="font-bold text-on-surface text-sm">${v.id_factura}</div>
          <div class="text-[10px] text-on-surface-variant uppercase">${fecha}</div>
        </td>
        <td class="px-4 py-4">
          <div class="font-bold text-on-surface">${v.cliente || "Consumidor Final"}</div>
          <div class="text-[10px] text-on-surface-variant">CC: ${v.cedula || "N/A"}</div>
        </td>
        <td class="px-4 py-4 font-medium text-on-surface-variant">${v.vendedor || "—"}</td>
        <td class="px-4 py-4">
          <div class="text-xs text-on-surface font-semibold truncate max-w-[150px]">${v.productos}</div>
          <div class="text-[10px] text-primary font-bold">IMEI: ${v.imeis || 'N/A'}</div>
        </td>
        <td class="px-4 py-4 text-right font-black text-on-surface text-sm">
          $${total}
        </td>
        <td class="px-4 py-4 text-center">
           <button onclick="window.viewSaleDetail('${v.id_factura}')" class="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
           </button>
        </td>
      </tr>
    `;
  }).join("");
}

window.viewSaleDetail = (id) => {
  const v = _ventas.find(x => x.id_factura === id);
  if (!v) return;

  const modal = document.getElementById("sale-detail-modal");
  const content = document.getElementById("sale-detail-content");
  const fmt = n => new Intl.NumberFormat("es-CO").format(n || 0);

  content.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <p class="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Comprobante de Venta</p>
          <p class="text-2xl font-black text-slate-900">${v.id_factura}</p>
          <p class="text-xs text-slate-500 font-medium">${new Date(v.fecha).toLocaleString('es-CO')}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Pagado</span>
          <p class="text-[11px] text-slate-500 mt-2 font-bold">${v.metodo}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Información del Cliente</p>
          <p class="text-sm font-black text-slate-900">${v.cliente}</p>
          <p class="text-xs text-slate-600">ID/Cédula: ${v.cedula || 'N/A'}</p>
          <p class="text-xs text-slate-600 mt-1"><span class="font-bold text-slate-400">Dirección:</span> ${v.direccion || 'Sin dirección'}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Atendido por</p>
          <p class="text-sm font-black text-slate-900">${v.vendedor}</p>
          <p class="text-xs text-slate-500 italic">Vendedor Autorizado</p>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Detalle de Productos</p>
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
           <div class="flex justify-between text-sm font-bold text-slate-800 mb-1">
              <span>${v.productos}</span>
              <span>x${v.cantidad || 1}</span>
           </div>
           <p class="text-[11px] text-primary font-mono font-bold uppercase tracking-tighter">IMEI/SERIE: ${v.imeis || 'N/A'}</p>
        </div>
      </div>

      <div class="bg-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="relative z-10 flex justify-between items-end">
          <div class="space-y-1">
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Resumen Financiero</p>
            <p class="text-xs opacity-80">Subtotal: $${fmt(v.subtotal)}</p>
            <p class="text-xs text-red-400 font-bold">Descuento: -$${fmt(v.descuento)}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Cobrado</p>
            <p class="text-3xl font-black text-white leading-none mt-1">$${fmt(v.total)}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Firma Vend.</p>
           ${v.id_firma_vendedor ? `<a href="${v.id_firma_vendedor}" target="_blank" class="h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200"><span class="material-symbols-outlined text-slate-400 text-sm">signature</span></a>` : `<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Firma Cli.</p>
           ${v.id_firma_comprador ? `<a href="${v.id_firma_comprador}" target="_blank" class="h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200"><span class="material-symbols-outlined text-slate-400 text-sm">person_check</span></a>` : `<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Evidencia</p>
           ${v.evidencia ? `<a href="${v.evidencia}" target="_blank" class="h-12 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/20"><span class="material-symbols-outlined text-primary/40 text-sm">image</span></a>` : `<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};
