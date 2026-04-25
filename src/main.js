import "./style.css";
import { navigate, registerView, onRouteChange } from "./router.js";
import { initInventory } from "./views/inventory.js";
import { initDashboard } from "./views/dashboard.js";
import { initPOS } from "./views/pos.js";
import { initIMEI } from "./views/imei.js";
import { initClients } from "./views/clients.js";
import { initCredits } from "./views/credits.js";
import { initSepare } from "./views/separe.js";
import { initPedidos } from "./views/pedidos.js";
import { initTechnical } from "./views/technical.js";
import { initExpenses } from "./views/expenses.js";
import { initSettings } from "./views/settings.js";
import { showToast } from "./toast.js";
import { login, verifyPin, logout, setToken, getToken } from "./api.js";

// ============================================================
// Session helpers (localStorage for persistence across tabs)
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
}

// ============================================================
// Login UI helpers
// ============================================================
const stepLogin = () => document.getElementById("step-credentials");
const stepPin   = () => document.getElementById("step-pin");

function showStep(step) {
  stepLogin().classList.toggle("hidden", step !== "credentials");
  stepPin().classList.toggle("hidden",   step !== "pin");
}

let _pendingEmail = "";

async function handleLoginStep1(e) {
  e.preventDefault();
  const btn   = document.getElementById("login-btn");
  const email = document.getElementById("login-email").value.trim();
  const pwd   = document.getElementById("login-pwd").value.trim();

  btn.disabled = true;
  btn.textContent = "Verificando...";

  try {
    const res = await login(email, pwd);
    if (res.success && res.step === "pin") {
      _pendingEmail = email;
      document.getElementById("pin-hint").textContent =
        `Enviamos un PIN de 6 dígitos a ${email}`;
      showStep("pin");
      document.getElementById("login-pin").focus();
    } else {
      showToast(res.mensaje || "Credenciales incorrectas", "error");
    }
  } catch (err) {
    showToast("Error de conexión: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Ingresar";
  }
}

async function handlePinStep(e) {
  e.preventDefault();
  const btn = document.getElementById("pin-btn");
  const pin = document.getElementById("login-pin").value.trim();

  btn.disabled = true;
  btn.textContent = "Verificando PIN...";

  try {
    const res = await verifyPin(_pendingEmail, pin);
    if (res.success && res.token) {
      saveSession({ email: res.email, nombre: res.nombre, rol: res.rol }, res.token);
      showApp(res.nombre);
    } else {
      showToast(res.mensaje || "PIN incorrecto", "error");
      document.getElementById("login-pin").value = "";
      document.getElementById("login-pin").focus();
    }
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Verificar";
  }
}

// ============================================================
// Navigation
// ============================================================
const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",    icon: "dashboard" },
  { id: "pos",        label: "Ventas (POS)", icon: "point_of_sale" },
  { id: "inventory",  label: "Inventario",   icon: "inventory_2" },
  { id: "imei",       label: "Equipos IMEI", icon: "phone_android" },
  { id: "clients",    label: "Clientes",     icon: "people" },
  { id: "credits",    label: "Créditos",     icon: "credit_score" },
  { id: "separe",     label: "Plan Separe",  icon: "savings" },
  { id: "pedidos",    label: "Pedidos",      icon: "local_shipping" },
  { id: "technical",  label: "Técnico",      icon: "build" },
  { id: "expenses",   label: "Egresos",      icon: "payments" },
  { id: "settings",   label: "Ajustes",      icon: "settings" },
];

function buildNavLinks(containerId, mobile = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (mobile) {
    const mobileItems = [
      { id: "dashboard", label: "Dashboard",  icon: "dashboard" },
      { id: "pos",       label: "Ventas",      icon: "point_of_sale" },
      { id: "inventory", label: "Inventario",  icon: "inventory_2" },
      { id: "credits",   label: "Créditos",    icon: "credit_score" },
      { id: "settings",  label: "Más",         icon: "menu" },
    ];
    container.innerHTML = mobileItems.map(item => `
      <button data-nav="${item.id}"
        class="nav-btn flex flex-col items-center justify-center gap-0.5 py-2 w-full
               text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[22px]">${item.icon}</span>
        <span class="text-[9px] font-semibold tracking-tight">${item.label}</span>
      </button>
    `).join("");
  } else {
    container.innerHTML = NAV_ITEMS.map(item => `
      <button data-nav="${item.id}"
        class="nav-btn flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left
               text-slate-400 hover:text-white hover:bg-slate-800/50
               transition-all duration-150 text-sm font-medium">
        <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `).join("");
  }

  container.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });
}

function setActiveNav(viewId) {
  document.querySelectorAll("#desktop-nav [data-nav]").forEach(btn => {
    const active = btn.dataset.nav === viewId;
    btn.classList.toggle("bg-red-600",    active);
    btn.classList.toggle("text-white",    active);
    btn.classList.toggle("text-slate-400",!active);
  });
  document.querySelectorAll("#mobile-nav [data-nav]").forEach(btn => {
    const active = btn.dataset.nav === viewId;
    btn.classList.toggle("text-primary",           active);
    btn.classList.toggle("text-on-surface-variant",!active);
  });
  const item  = NAV_ITEMS.find(i => i.id === viewId);
  const title = document.getElementById("header-title");
  if (title && item) title.textContent = item.label;
}

// ============================================================
// Show/hide screens
// ============================================================
function showApp(nombre) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-shell").classList.remove("hidden");

  const userEl = document.getElementById("user-name");
  if (userEl) userEl.textContent = nombre || "Usuario";

  buildNavLinks("desktop-nav", false);
  buildNavLinks("mobile-nav",  true);
  onRouteChange(setActiveNav);

  const loadInv = initInventory();
  registerView("inventory", loadInv);

  const loadDash = initDashboard();
  registerView("dashboard", loadDash);

  const loadPos = initPOS();
  registerView("pos", loadPos);

  const loadImei = initIMEI();
  registerView("imei", loadImei);

  const loadClients = initClients();
  registerView("clients", loadClients);

  const loadCredits = initCredits();
  registerView("credits", loadCredits);

  const loadSepare = initSepare();
  registerView("separe", loadSepare);

  const loadPedidos = initPedidos();
  registerView("pedidos", loadPedidos);

  const loadTechnical = initTechnical();
  registerView("technical", loadTechnical);

  const loadExpenses = initExpenses();
  registerView("expenses", loadExpenses);

  const loadSettings = initSettings();
  registerView("settings", loadSettings);

  navigate("dashboard");
}

function showLoginScreen() {
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  showStep("credentials");
  _pendingEmail = "";
}

// ============================================================
// Logout
// ============================================================
async function handleLogout() {
  try { await logout(); } catch { /* ignore */ }
  clearSession();
  showLoginScreen();
  showToast("Sesión cerrada", "info");
}

// ============================================================
// Session expired (token invalid on any API call)
// ============================================================
window.addEventListener("session-expired", () => {
  clearSession();
  showLoginScreen();
  showToast("Tu sesión expiró. Inicia sesión de nuevo.", "warning");
});

// ============================================================
// Event bindings
// ============================================================
document.getElementById("login-form")?.addEventListener("submit", handleLoginStep1);
document.getElementById("pin-form")?.addEventListener("submit", handlePinStep);
document.getElementById("back-to-login")?.addEventListener("click", () => showStep("credentials"));
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

// ============================================================
// Bootstrap — restore session on page load
// ============================================================
const session = getSession();
if (session && session.token && getToken()) {
  setToken(session.token);
  showApp(session.nombre);
} else {
  clearSession();
  showLoginScreen();
}
