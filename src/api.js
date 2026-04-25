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
export const getClientes = async () => {
  const data = await get("getClientes");
  return data.map(r => ({ cedula: r[0], nombre: r[1], telefono: r[2], direccion: r[3], email: r[4], tipo: r[5], fechaRegistro: r[6] }));
};
export const crearCliente = (d) => post({ action: "crearCliente", datos: [d.cedula, d.nombre, d.telefono, d.direccion, d.email, d.tipo, new Date().toISOString()] });
export const actualizarCliente = (id, d) => post({ action: "actualizarCliente", id, datos: [d.cedula, d.nombre, d.telefono, d.direccion, d.email, d.tipo, new Date().toISOString()] });
export const eliminarCliente = (id) => post({ action: "eliminarCliente", id });

// ---- Dashboard ----
export const getDashboard = () => get("getDashboard");

// ---- Ventas ----
export const getVentas = () => get("getVentas");
export const registrarVenta = (datos) => post({ action: "registrarVenta", datos }); // Ventas already sends proper format? Wait, Ventas was tested and it worked, but let's leave it as is.

// ---- Créditos ----
export const getCreditos = async () => {
  const data = await get("getCreditos");
  return data.map(r => ({ id: r[0], cliente: r[1], telefono: r[2], idFactura: r[3], fecha: r[4], total: r[5], abonado: r[6], detalleUltimoPago: r[7], saldo: r[8], estado: r[9] }));
};
export const crearCredito = (d) => post({ action: "crearCredito", datos: [d.id || "CRD-"+Date.now(), d.cliente, d.telefono, d.idFactura, d.fecha || new Date().toISOString(), d.total, d.abonado, d.detalleUltimoPago || "", d.saldo, d.estado || "Activo"] });
export const actualizarCredito = (id, d) => post({ action: "actualizarCredito", id, datos: [d.id, d.cliente, d.telefono, d.idFactura, d.fecha, d.total, d.abonado, d.detalleUltimoPago, d.saldo, d.estado] });

// ---- Equipos IMEI ----
export const getEquipos = async () => {
  const data = await get("getEquipos");
  return data.map(r => ({ imei1: r[0], imei2: r[1], idProducto: r[2], marca: r[3], nombre: r[4], proveedor: r[5], costo: r[6], venta: r[7], estado: r[8], fechaIngreso: r[9] }));
};
export const crearEquipo = (d) => post({ action: "crearEquipo", datos: [d.imei1, d.imei2, d.idProducto, d.marca, d.nombre, d.proveedor, d.costo, d.venta, d.estado, d.fechaIngreso || new Date().toISOString()] });
export const actualizarEquipo = (id, d) => post({ action: "actualizarEquipo", id, datos: [d.imei1, d.imei2, d.idProducto, d.marca, d.nombre, d.proveedor, d.costo, d.venta, d.estado, d.fechaIngreso] });
export const eliminarEquipo = (id) => post({ action: "eliminarEquipo", id });

// ---- Plan Separe ----
export const getSepare = async () => {
  const data = await get("getSepare");
  return data.map(r => ({ idSepare: r[0], cedula: r[1], cliente: r[2], telefono: r[3], producto: r[4], marca: r[5], imeiReservado: r[6], total: r[7], saldo: r[8], fechaLimite: r[9], estado: r[10], historialPagos: r[11], firma: r[12] }));
};
export const abonarSepare = (idSepare, montoAbono, firma = "") => post({ action: "abonoSepare", idSepare, montoAbono, firma });

// ---- Pedidos Externos ----
export const getPedidos = async () => {
  const data = await get("getPedidos");
  return data.map(r => ({ id: r[0], cliente: r[1], producto: r[2], proveedor: r[3], costoAprox: r[4], precioFinal: r[5], abono: r[6], estado: r[7] }));
};
export const crearPedido = (d) => post({ action: "crearPedido", datos: [d.id || "PED-"+Date.now(), d.cliente, d.producto, d.proveedor || "", d.costoAprox || 0, d.precioFinal || 0, d.abono || 0, d.estado || "Pendiente"] });
export const actualizarPedido = (id, d) => post({ action: "actualizarPedido", id, datos: [d.id, d.cliente, d.producto, d.proveedor, d.costoAprox, d.precioFinal, d.abono, d.estado] });
export const eliminarPedido = (id) => post({ action: "eliminarPedido", id });

// ---- Servicio Técnico ----
export const getServicioTecnico = async () => {
  const data = await get("getTechnical");
  return data.map(r => ({ id: r[0], cliente: r[1], telefono: r[2], equipo: r[3], imei: r[4], falla: r[5], clave: r[6], repuestos: r[7], costo: r[8], abono: r[9], precioFinal: r[10], estado: r[11], evidencias: r[12] }));
};
export const crearServicioTecnico = (d) => post({ action: "crearServicioTecnico", datos: [d.id || "TEC-"+Date.now(), d.cliente, d.telefono || "", d.equipo, d.imei || "", d.falla, d.clave || "", d.repuestos || "", d.costo || 0, d.abono || 0, d.precioFinal || 0, d.estado || "Ingresado", d.evidencias || ""] });
export const actualizarServicioTecnico = (id, d) => post({ action: "actualizarServicioTecnico", id, datos: [d.id, d.cliente, d.telefono, d.equipo, d.imei, d.falla, d.clave, d.repuestos, d.costo, d.abono, d.precioFinal, d.estado, d.evidencias] });
export const eliminarServicioTecnico = (id) => post({ action: "eliminarServicioTecnico", id });

// ---- Egresos ----
export const getEgresos = async () => {
  const data = await get("getEgresos");
  return data.map(r => ({ id: r[0], fecha: r[1], categoria: r[2], concepto: r[3], responsable: r[4], monto: r[5], evidencia: r[6] }));
};
export const registrarEgreso = (d) => post({ action: "registrarEgreso", datos: [d.id || "EGR-"+Date.now(), d.fecha || new Date().toISOString(), d.categoria, d.concepto, d.responsable, d.monto, d.evidencia || ""] });
