// ============================================================
// api.js — AdminPro API service
// All protected calls include the session token automatically.
// ============================================================
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBxFHZiuHHytnjnEz71RbLs2JSH25Z9MA2np6TEpTuRNmcUvUjeucSQ0neg_GcjgvB/exec";

// ---- Token management ----
let _sessionToken = null;

export function setToken(token) {
  _sessionToken = token;
  if (token) sessionStorage.setItem("adminpro_token", token);
  else sessionStorage.removeItem("adminpro_token");
}

export function getToken() {
  if (_sessionToken) return _sessionToken;
  _sessionToken = sessionStorage.getItem("adminpro_token") || null;
  return _sessionToken;
}

// ---- HTTP helpers ----
async function get(action, params = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", action);
  const token = getToken();
  if (token) url.searchParams.set("token", token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data && data.mensaje && data.mensaje.includes("expirada")) {
    setToken(null);
    window.dispatchEvent(new CustomEvent("session-expired"));
  }
  return data;
}

async function post(payload) {
  const token = getToken();
  const body = token ? { ...payload, token } : payload;
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data && data.mensaje && data.mensaje.includes("expirada")) {
    setToken(null);
    window.dispatchEvent(new CustomEvent("session-expired"));
  }
  return data;
}

// ---- Auth (public — no token needed) ----
export const login = (email, password) => get("login", { email, password });
export const verifyPin = (email, pin) => get("verifyPin", { email, pin });
export const logout = () => get("logout");

// ---- Inventario ----
export const getInventario = () => get("getInventario");
export const crearProducto = (datos) => post({ action: "crearProducto", datos });
export const actualizarProducto = (id, datos) => post({ action: "actualizarProducto", id, datos });
export const eliminarProducto = (id) => post({ action: "eliminarProducto", id });
export const uploadFoto = (base64Data, fileName, mimeType) =>
  post({ action: "uploadFoto", base64Data, fileName, mimeType });

// ---- Clientes ----
export const getClientes = () => get("getClientes");
export const crearCliente = (datos) => post({ action: "crearCliente", datos });
export const actualizarCliente = (id, datos) => post({ action: "actualizarCliente", id, datos });
export const eliminarCliente = (id) => post({ action: "eliminarCliente", id });

// ---- Dashboard ----
export const getDashboard = () => get("getDashboard");

// ---- Ventas ----
export const getVentas = () => get("getVentas");
export const registrarVenta = (datos) => post({ action: "registrarVenta", datos });

// ---- Créditos ----
export const getCreditos = () => get("getCreditos");
export const crearCredito = (datos) => post({ action: "crearCredito", datos });
export const actualizarCredito = (id, datos) => post({ action: "actualizarCredito", id, datos });

// ---- Equipos IMEI ----
export const getEquipos = () => get("getEquipos");
export const crearEquipo = (datos) => post({ action: "crearEquipo", datos });
export const actualizarEquipo = (id, datos) => post({ action: "actualizarEquipo", id, datos });
export const eliminarEquipo = (id) => post({ action: "eliminarEquipo", id });

// ---- Plan Separe ----
export const getSepare = () => get("getSepare");
export const abonarSepare = (idSepare, montoAbono, firma = "") => post({ action: "abonoSepare", idSepare, montoAbono, firma });
