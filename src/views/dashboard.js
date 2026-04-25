import { getDashboard } from "../api.js";
import { navigate } from "../router.js";

let _isLoaded = false;
let _eventsReady = false;

export function initDashboard() {
  return async () => {
    setGreeting();
    if (!_eventsReady) {
      setupDashEvents();
      _eventsReady = true;
    }
    await loadDashboard();
  };
}

function setGreeting() {
  const h = new Date().getHours();
  let saludo = "Buenas noches 🌙";
  if (h >= 5 && h < 12) saludo = "Buenos días ☀️";
  else if (h >= 12 && h < 18) saludo = "Buenas tardes 🌤️";
  const el = document.getElementById("dash-greeting");
  if (el) {
    try {
      const session = JSON.parse(localStorage.getItem("adminproSession") || "{}");
      const nombre = session.nombre ? session.nombre.split(" ")[0] : "";
      el.textContent = `${saludo}${nombre ? ", " + nombre : ""} 👋`;
    } catch { el.textContent = saludo + " 👋"; }
  }
}

function setupDashEvents() {
  // Refresh
  document.getElementById("dash-refresh-btn")?.addEventListener("click", () => {
    _isLoaded = false;
    loadDashboard();
  });

  // Quick-access navigation
  document.querySelectorAll(".dash-shortcut[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.goto));
  });
}

const CUR = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

async function loadDashboard() {
  try {
    const d = await getDashboard();

    // KPI cards
    setText("dash-ventas-hoy", CUR(d.ingresosHoy || 0));
    setText("dash-egresos-hoy", CUR(d.egresosHoy || 0));
    setText("dash-utilidad", CUR(d.utilidad || 0));
    setText("dash-stock-critico", `${d.stockCritico || 0} productos`);

    // Counters
    setText("dash-cnt-productos", d.totalProductos || 0);
    setText("dash-cnt-clientes", d.totalClientes || 0);
    setText("dash-cnt-equipos", d.totalEquipos || 0);
    setText("dash-cnt-creditos", d.creditosActivos || 0);
    setText("dash-cnt-pedidos", d.pedidosPendientes || 0);
    setText("dash-cnt-separe", d.separeActivos || 0);

    // Ventas Recientes
    renderVentasRecientes(d.ventasRecientes || []);

    // Top Productos
    renderTopProductos(d.topProductos || []);

    // Stock Alertas
    renderStockAlertas(d.productosBajoStock || []);

    // Bar Chart
    renderBarChart(d.labels7d || [], d.ventas7d || []);

    // Servicio Técnico
    renderTecnico(d.tecRecientes || []);

    _isLoaded = true;
  } catch (err) {
    console.error("Error loading dashboard", err);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderVentasRecientes(ventas) {
  const container = document.getElementById("dash-ventas-list");
  if (!container) return;

  if (!ventas.length) {
    container.innerHTML = `<div class="flex flex-col items-center py-10 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl mb-2">receipt_long</span>
      <p class="text-sm font-medium">No hay ventas registradas aún</p>
    </div>`;
    return;
  }

  container.innerHTML = ventas.map(v => {
    const metodoBadge = {
      Efectivo: "bg-green-100 text-green-800",
      Nequi: "bg-purple-100 text-purple-800",
      Daviplata: "bg-red-100 text-red-800",
      Transferencia: "bg-blue-100 text-blue-800",
    }[v.metodo] || "bg-surface-container text-on-surface-variant";

    return `
      <div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors">
        <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary text-[18px]">receipt</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-on-surface truncate">${v.cliente || "Cliente"}</p>
          <p class="text-[11px] text-on-surface-variant">${v.id} · ${v.fecha || ""}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-bold text-on-surface">${CUR(v.total)}</p>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${metodoBadge}">${v.metodo || "—"}</span>
        </div>
      </div>`;
  }).join("");
}

function renderTopProductos(productos) {
  const ul = document.getElementById("dash-top-productos");
  if (!ul) return;

  if (!productos.length) {
    ul.innerHTML = `<li class="text-sm text-on-surface-variant text-center py-4">Sin datos</li>`;
    return;
  }

  const maxCant = Math.max(...productos.map(p => p.cantidad), 1);

  ul.innerHTML = productos.map((p, i) => {
    const pct = Math.round((p.cantidad / maxCant) * 100);
    const medals = ["🥇", "🥈", "🥉"];
    const medal = i < 3 ? medals[i] : `${i + 1}.`;

    return `
      <li>
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="text-sm">${medal}</span>
            <span class="text-xs font-semibold text-on-surface truncate max-w-[140px]">${p.nombre}</span>
          </div>
          <span class="text-xs font-bold text-primary">${p.cantidad} unds</span>
        </div>
        <div class="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div class="h-full bg-primary/70 rounded-full transition-all" style="width: ${pct}%"></div>
        </div>
      </li>`;
  }).join("");
}

function renderStockAlertas(items) {
  const ul = document.getElementById("dash-stock-alertas");
  if (!ul) return;

  if (!items.length) {
    ul.innerHTML = `<li class="flex flex-col items-center py-4 text-on-surface-variant">
      <span class="material-symbols-outlined text-2xl text-green-600 mb-1">check_circle</span>
      <p class="text-xs font-medium">Todo el stock está en orden</p>
    </li>`;
    return;
  }

  ul.innerHTML = items.map(p => `
    <li class="flex items-center gap-3 p-2 rounded-lg bg-error-container/10">
      <span class="material-symbols-outlined text-error text-[18px]">warning</span>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold text-on-surface truncate">${p.nombre}</p>
        <p class="text-[10px] text-on-surface-variant">${p.marca}</p>
      </div>
      <div class="text-right flex-shrink-0">
        <p class="text-xs font-black text-error">${p.stock} / ${p.minimo}</p>
        <p class="text-[9px] text-on-surface-variant">actual / mín</p>
      </div>
    </li>`).join("");
}

function renderBarChart(labels = [], data = []) {
  const container = document.getElementById("dash-chart");
  if (!container) return;

  if (!data.length || data.every(v => v === 0)) {
    container.innerHTML = `<div class="flex-1 flex items-center justify-center text-on-surface-variant">
      <div class="text-center">
        <span class="material-symbols-outlined text-3xl mb-1">bar_chart</span>
        <p class="text-xs font-medium">Sin ventas esta semana</p>
      </div>
    </div>`;
    return;
  }

  const max = Math.max(...data, 1);
  const maxH = 140; // px

  container.innerHTML = data.map((val, i) => {
    const barH = Math.max(Math.round((val / max) * maxH), 4);
    const isZero = val === 0;
    return `
      <div class="flex-1 flex flex-col items-center group" style="height:${maxH + 28}px;">
        <div class="flex-1 w-full flex items-end justify-center">
          <div class="w-full max-w-[40px] rounded-t-md transition-all duration-300 relative ${isZero ? 'bg-surface-container' : 'bg-blue-500 group-hover:bg-blue-700'}"
               style="height: ${barH}px;">
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-bold z-10">
              ${CUR(val)}
            </div>
          </div>
        </div>
        <span class="text-[10px] text-on-surface-variant font-bold uppercase mt-2">${labels[i] || ""}</span>
      </div>`;
  }).join("");
}

function renderTecnico(items) {
  const ul = document.getElementById("dash-tec-list");
  if (!ul) return;

  if (!items.length) {
    ul.innerHTML = `<li class="flex flex-col items-center py-10 text-on-surface-variant">
      <span class="material-symbols-outlined text-3xl mb-2">build</span>
      <p class="text-xs font-medium">No hay equipos en servicio</p>
    </li>`;
    return;
  }

  const estadoColor = {
    Ingresado: "bg-blue-100 text-blue-800",
    "En Revisión": "bg-amber-100 text-amber-800",
    Reparado: "bg-green-100 text-green-800",
    "Sin Arreglo": "bg-red-100 text-red-800",
    Entregado: "bg-surface-container text-on-surface-variant",
  };

  ul.innerHTML = items.map(t => `
    <li class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors">
      <div class="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
        <span class="material-symbols-outlined text-purple-700 text-[18px]">phone_android</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-on-surface truncate">${t.equipo || "Equipo"}</p>
        <p class="text-[11px] text-on-surface-variant">${t.cliente || ""} · ${t.id}</p>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded ${estadoColor[t.estado] || "bg-surface-container text-on-surface-variant"}">${t.estado || "—"}</span>
    </li>`).join("");
}
