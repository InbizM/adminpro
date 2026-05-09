import "./style.css";

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/adminpro/sw.js', { scope: '/adminpro/' }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

import { navigate, registerView, onRouteChange, onBeforeRoute } from "./router.js";
import { initInventory } from "./views/inventory.js";
import { initDashboard } from "./views/dashboard.js";
import { initPOS } from "./views/pos.js";
import { initIMEI } from "./views/imei.js";
import { initClients } from "./views/clients.js";
import { initCredits } from "./views/credits.js";
import { initSalesHistory } from "./views/sales-history.js";
import { initTasks } from "./views/tasks.js";
import { initCalendar } from "./views/calendar.js";
import { initUsers } from "./views/users.js";
import { initReventas } from "./views/reventas.js";
import { initTechnical } from "./views/technical.js";
import { initExpenses } from "./views/expenses.js";
import { initNominas } from "./views/nominas.js";
import { initSettings } from "./views/settings.js";
import { showToast } from "./toast.js";
import { login, verifyPin, logout, setToken, getToken } from "./api.js";

let _pendingEmail = "";

// ============================================================
// Physical Barcode Scanner Support
// ============================================================
let _barcodeBuffer = "";
let _barcodeTimer = null;

document.addEventListener("keydown", (e) => {
  // Ignorar atajos de teclado
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key === "Enter") {
    if (_barcodeBuffer.length >= 3) {
      const code = _barcodeBuffer;
      _barcodeBuffer = "";
      clearTimeout(_barcodeTimer);
      
      // Emitir evento global que las vistas pueden atrapar
      document.dispatchEvent(new CustomEvent('barcodeScanned', { detail: code }));
      
      // Evitar que el 'Enter' dispare envíos de formularios no deseados
      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      if (activeTag !== "TEXTAREA") {
        e.preventDefault();
      }
      return;
    }
    _barcodeBuffer = ""; // Resetear en un Enter normal
  } else if (e.key.length === 1) {
    _barcodeBuffer += e.key;
    clearTimeout(_barcodeTimer);
    // Un lector físico lee muy rápido (ej. 10-30ms por carácter). 
    // Si pasan más de 50ms, asumimos que es una persona tipeando y reseteamos el buffer.
    _barcodeTimer = setTimeout(() => {
      _barcodeBuffer = "";
    }, 50);
  }
});

// ============================================================
// Session helpers
// ============================================================
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem("adminproSession") || "null");
    return s && Date.now() < s.expiresAt ? s : null;
  } catch { return null; }
}

function saveSession(data, token) {
  setToken(token);
  localStorage.setItem("adminproSession", JSON.stringify({
    ...data,
    token,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8h
  }));
}

function clearSession() {
  setToken(null);
  localStorage.removeItem("adminproSession");
  localStorage.removeItem("adminpro_user");
}

// ============================================================
// Navigation Groups
// ============================================================
const NAV_GROUPS = [
  { label: "Inicio", items: [{ id: "dashboard", label: "Dashboard", icon: "dashboard", roles: ["Administrador", "Vendedor", "Técnico"] }] },
  {
    label: "Operaciones",
    items: [
      { id: "pos",           label: "Ventas (POS)",        icon: "point_of_sale", roles: ["Administrador", "Vendedor"] },
      { id: "sales-history", label: "Historial de Ventas", icon: "history",       roles: ["Administrador", "Vendedor"] },
      { id: "credits",       label: "Créditos",            icon: "credit_score",  roles: ["Administrador", "Vendedor"] },
      { id: "expenses",      label: "Egresos",             icon: "payments",      roles: ["Administrador"] },
      { id: "nominas",       label: "Nóminas",             icon: "request_quote", roles: ["Administrador"] }
    ]
  },
  {
    label: "Inventario",
    items: [
      { id: "inventory",     label: "Catálogo General",    icon: "inventory_2",   roles: ["Administrador", "Vendedor", "Técnico"] },
      { id: "imei",          label: "Equipos IMEI",        icon: "phone_android", roles: ["Administrador", "Vendedor"] },
      { id: "reventas",      label: "Reventas",            icon: "storefront",    roles: ["Administrador", "Vendedor"] }
    ]
  },
  { label: "Servicios", items: [{ id: "technical", label: "Servicio Técnico", icon: "build", roles: ["Administrador", "Técnico"] }] },
  {
    label: "Organización",
    items: [
      { id: "tasks",         label: "Lista de Tareas",     icon: "check_circle",   roles: ["Administrador", "Vendedor", "Técnico"] },
      { id: "calendar",      label: "Actividad",           icon: "history_toggle_off", roles: ["Administrador", "Vendedor", "Técnico"] }
    ]
  },
  {
    label: "Personas",
    items: [
      { id: "clients",       label: "Clientes",            icon: "people",          roles: ["Administrador", "Vendedor", "Técnico"] },
      { id: "users",         label: "Equipo / Usuarios",   icon: "manage_accounts", roles: ["Administrador"] }
    ]
  },
  { label: "Otros", items: [{ id: "settings", label: "Ajustes", icon: "settings", roles: ["Administrador", "Vendedor", "Técnico"] }] }
];

// ============================================================
// Mobile Menu Logic
// ============================================================
function toggleMobileMenu(open) {
  const drawer = document.getElementById("mobile-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const content = document.getElementById("mobile-drawer-content");

  if (open) {
    drawer.classList.remove("hidden");
    setTimeout(() => {
      backdrop.classList.replace("opacity-0", "opacity-100");
      content.classList.replace("translate-y-full", "translate-y-0");
    }, 10);
  } else {
    backdrop.classList.replace("opacity-100", "opacity-0");
    content.classList.replace("translate-y-0", "translate-y-full");
    setTimeout(() => drawer.classList.add("hidden"), 300);
  }
}

function buildNavLinks(containerId, rol, mobile = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const userRol = rol || 'Vendedor';
  let html = "";

  if (mobile) {
    // Barra Inferior (Solo 5 iconos: 4 fijos + 1 de Menú)
    let primaryItems = [];
    if (userRol === 'Técnico') {
      primaryItems = [
        { id: "dashboard", label: "Home",     icon: "dashboard" },
        { id: "technical", label: "Reparar",  icon: "build" },
        { id: "inventory", label: "Stock",    icon: "inventory_2" },
        { id: "tasks",     label: "Tareas",   icon: "check_circle" }
      ];
    } else {
      primaryItems = [
        { id: "dashboard", label: "Home",     icon: "dashboard" },
        { id: "pos",       label: "Venta",    icon: "point_of_sale" },
        { id: "inventory", label: "Stock",    icon: "inventory_2" },
        { id: "tasks",     label: "Tareas",   icon: "check_circle" }
      ];
    }

    html = primaryItems.map(item => `
      <button data-nav="${item.id}" class="nav-btn flex flex-col items-center justify-center gap-0.5 py-2 w-full text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[24px]">${item.icon}</span>
        <span class="text-[10px] font-bold tracking-tight">${item.label}</span>
      </button>
    `).join("");

    // Botón "MÁS" para abrir el Drawer
    html += `
      <button id="mobile-more-btn" class="flex flex-col items-center justify-center gap-0.5 py-2 w-full text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[24px]">apps</span>
        <span class="text-[10px] font-bold tracking-tight">Más</span>
      </button>
    `;

    // Llenar el Drawer Grid con TODOS los elementos
    const drawerGrid = document.getElementById("mobile-drawer-grid");
    if (drawerGrid) {
      drawerGrid.innerHTML = NAV_GROUPS.flatMap(g => g.items).filter(i => !i.roles || i.roles.includes(userRol)).map(item => `
        <button data-nav="${item.id}" class="flex flex-col items-center gap-2 p-4 bg-surface-container rounded-2xl active:scale-95 transition-all">
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-primary text-[24px]">${item.icon}</span>
          </div>
          <span class="text-[11px] font-bold text-on-surface text-center leading-tight">${item.label}</span>
        </button>
      `).join("");
    }
  } else {
    // Menú Desktop Grouped
    NAV_GROUPS.forEach(group => {
      const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(userRol));
      if (visibleItems.length === 0) return;
      html += `<p class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mt-6 mb-2 px-4 italic">${group.label}</p>`;
      visibleItems.forEach(item => {
        html += `
          <button data-nav="${item.id}" class="nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150 text-sm font-medium mb-0.5 group">
            <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `;
      });
    });
  }

  container.innerHTML = html;

  // Event Listeners
  if (mobile) {
    document.getElementById("mobile-more-btn")?.addEventListener("click", () => toggleMobileMenu(true));
    document.getElementById("mobile-drawer-close")?.addEventListener("click", () => toggleMobileMenu(false));
    document.getElementById("mobile-drawer-backdrop")?.addEventListener("click", () => toggleMobileMenu(false));
    
    // Al elegir una opción del drawer, cerrar menú
    document.querySelectorAll("#mobile-drawer-grid [data-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        toggleMobileMenu(false);
        navigate(btn.dataset.nav);
      });
    });
  }

  container.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });
}

function setActiveNav(viewId) {
  // Desktop highligh
  document.querySelectorAll("#desktop-nav [data-nav]").forEach(btn => {
    const active = btn.dataset.nav === viewId;
    btn.classList.toggle("bg-primary", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("shadow-lg", active);
    btn.classList.toggle("text-slate-400", !active);
  });
  
  // Mobile bar highlight
  document.querySelectorAll("#mobile-nav [data-nav]").forEach(btn => {
    const active = btn.dataset.nav === viewId;
    btn.classList.toggle("text-primary", active);
    btn.classList.toggle("text-on-surface-variant", !active);
  });
  
  // Header title update
  let label = "AdminPro";
  NAV_GROUPS.forEach(g => {
    const it = g.items.find(i => i.id === viewId);
    if (it) label = it.label;
  });
  const t = document.getElementById("header-title");
  if (t) t.textContent = label;
}

// ============================================================
// App Lifecycle
// ============================================================
function showApp(nombre, rol) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");
  const userEl = document.getElementById("user-name");
  if (userEl) userEl.textContent = nombre || "Usuario";

  buildNavLinks("desktop-nav", rol, false);
  buildNavLinks("mobile-nav",  rol, true);
  
  const userRol = rol || 'Vendedor';
  
  onBeforeRoute((viewId) => {
    let allowed = false;
    let found = false;
    NAV_GROUPS.forEach(g => {
      const it = g.items.find(i => i.id === viewId);
      if (it) {
        found = true;
        if (!it.roles || it.roles.includes(userRol)) allowed = true;
      }
    });
    // If it's a known restricted route and not allowed, block it.
    if (found && !allowed) {
      showToast("No tienes permiso para acceder a este módulo", "warning");
      return "dashboard"; // Redirect
    }
  });

  // Hide unauthorized dashboard shortcuts
  document.querySelectorAll("[data-goto]").forEach(btn => {
    const targetView = btn.dataset.goto;
    let allowed = false;
    NAV_GROUPS.forEach(g => {
      const it = g.items.find(i => i.id === targetView);
      if (it && (!it.roles || it.roles.includes(userRol))) allowed = true;
    });
    if (!allowed) {
      btn.classList.add("hidden");
      // Si es un div padre contenedor flex, también lo ocultamos si queremos, pero con hidden basta para el shortcut.
    } else {
      btn.classList.remove("hidden");
    }
  });

  onRouteChange(setActiveNav);

  registerView("inventory", initInventory());
  registerView("dashboard", initDashboard());
  registerView("pos", initPOS());
  registerView("imei", initIMEI());
  registerView("clients", initClients());
  registerView("credits", initCredits());
  registerView("sales-history", initSalesHistory());
  registerView("tasks", initTasks());
  registerView("calendar", initCalendar());
  registerView("users", initUsers());
  registerView("reventas", initReventas());
  registerView("technical", initTechnical());
  registerView("expenses", initExpenses());
  registerView("nominas", initNominas());
  registerView("settings", initSettings());

  navigate("dashboard");
}

function showStep(step) {
  const stepCredentials = document.getElementById("step-credentials");
  const stepPin = document.getElementById("step-pin");
  if (stepCredentials) stepCredentials.classList.toggle("hidden", step !== "credentials");
  if (stepPin) stepPin.classList.toggle("hidden", step !== "pin");
}

function showLoginScreen() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  showStep("credentials");
}

async function handleLogout() {
  await logout();
  clearSession();
  showLoginScreen();
}

// ============================================================
// Events & Bootstrap
// ============================================================
window.addEventListener("session-expired", () => {
  clearSession();
  showLoginScreen();
});

document.getElementById("login-form")?.addEventListener("submit", handleLoginStep1);
document.getElementById("pin-form")?.addEventListener("submit", handlePinStep);
document.getElementById("back-to-login")?.addEventListener("click", () => showStep("credentials"));
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

async function handleLoginStep1(e) {
  e.preventDefault();
  const btn = document.getElementById("login-btn");
  const email = document.getElementById("login-email").value.trim();
  const pwd = document.getElementById("login-pwd").value.trim();
  btn.disabled = true; btn.textContent = "Verificando...";
  try {
    const res = await login(email, pwd);
    if (res.success && res.step === "pin") {
      _pendingEmail = email;
      document.getElementById("pin-hint").textContent = `Enviamos un PIN a ${email}`;
      showStep("pin");
      document.getElementById("login-pin").focus();
    } else { showToast(res.mensaje || "Credenciales incorrectas", "error"); }
  } catch (err) { showToast("Error de conexión", "error"); }
  finally { btn.disabled = false; btn.textContent = "Ingresar"; }
}

async function handlePinStep(e) {
  e.preventDefault();
  const btn = document.getElementById("pin-btn");
  const pin = document.getElementById("login-pin").value.trim();
  btn.disabled = true; btn.textContent = "Verificando...";
  try {
    const res = await verifyPin(_pendingEmail, pin);
    if (res.success && res.token) {
      saveSession({ email: res.email, nombre: res.nombre, rol: res.rol }, res.token);
      showApp(res.nombre, res.rol);
    } else { showToast(res.mensaje || "PIN incorrecto", "error"); }
  } catch (err) { showToast("Error", "error"); }
  finally { btn.disabled = false; btn.textContent = "Verificar"; }
}

const session = getSession();
if (session && session.token && getToken()) {
  setToken(session.token);
  showApp(session.nombre, session.rol);
} else {
  clearSession();
  showLoginScreen();
}
