// ============================================================
// api.js — AdminPro API Service (V12 EXPENSES ID FIX)
// ============================================================

const TURSO_URL = "https://adminpro-adminpro.aws-us-west-2.turso.io/v2/pipeline";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcyOTIwOTMsImlkIjoiMDE5ZGNlZGItOTIwMS03NGVkLWIwZGYtZjg4MTQ3NjlhODcxIiwicmlkIjoiNWIwMWViNTctYTgxYS00OTI0LWIzMDUtZjk1Y2EwMjUzNmRkIn0.oruUZmv_ZLWlKA2ctQnghAD5PIiJSIeR4nzbZia-q-f1r12IHhLv1hDw9CsReABIceaVRHPS52JMZ4j3lcZ1Bw";
const GAS_URL = "https://script.google.com/macros/s/AKfycbxxs-PUyNqqALN2-azEHaViv5PM1r5oteanvr2Sfydic-bBQJrGWj00R0FO7UAlP4Ug/exec";

let _gasToken = localStorage.getItem("adminpro_gas_token") || "";

// ── HELPERS ──
export const setToken = (t) => { _gasToken = t; localStorage.setItem("adminpro_gas_token", t); };
export const getToken = () => _gasToken;
export const logout = () => { localStorage.clear(); location.reload(); };

async function queryTurso(sqls) {
  const requests = Array.isArray(sqls)
    ? sqls.map(s => (typeof s === 'string' ? { type: "execute", stmt: { sql: s } } : (s.type ? s : { type: "execute", stmt: s })))
    : [{ type: "execute", stmt: (typeof sqls === 'string' ? { sql: sqls } : sqls) }];
  const res = await fetch(TURSO_URL, { method: "POST", headers: { "Authorization": `Bearer ${TURSO_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ requests }) });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return (data.results || []).map(r => {
    if (!r.response || !r.response.result) return [];
    const { cols, rows } = r.response.result;
    return rows.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col.name] = row[i].value; });
      return obj;
    });
  });
}
const mapArgs = (d) => d.map(v => ({ type: typeof v === 'number' ? 'float' : 'text', value: String(v) }));

async function fetchGAS(payload) {
  const res = await fetch(GAS_URL, { method: "POST", mode: "cors", body: JSON.stringify(payload) });
  return await res.json();
}

// ── DRIVE UPLOADS ──
export const uploadFoto = async (base64, fileName, mimeType) => (await fetchGAS({ action: "uploadFoto", token: _gasToken, base64Data: base64, fileName, mimeType })).url || "";
export const uploadSignature = async (base64, fileName) => (await fetchGAS({ action: "uploadSignature", token: _gasToken, base64Data: base64, fileName })).url || "";
export const uploadEvidencia = async (base64, fileName, mimeType) => (await fetchGAS({ action: "uploadEvidencia", token: _gasToken, base64Data: base64, fileName, mimeType })).url || "";

// ── AUTH ──
export const login = async (email, password) => {
  const results = await queryTurso({ sql: "SELECT * FROM usuarios WHERE email = ? AND password = ? AND estado = 'Activo'", args: [{ type: "text", value: email.toLowerCase() }, { type: "text", value: password }] });
  if (!results[0] || results[0].length === 0) return { success: false, mensaje: "Credenciales incorrectas" };
  return await (await fetch(`${GAS_URL}?action=login&email=${encodeURIComponent(email)}&password=${password}`)).json();
};
export const verifyPin = async (email, pin) => {
  const res = await (await fetch(`${GAS_URL}?action=verifyPin&email=${encodeURIComponent(email)}&pin=${pin}`)).json();
  if (res.success) {
    setToken(res.token);
    const results = await queryTurso({ sql: "SELECT nombre, rol, email FROM usuarios WHERE email = ?", args: [{ type: "text", value: email.toLowerCase() }] });
    const fullUser = { ...(results[0]?.[0] || { nombre: 'Usuario' }), token: res.token };
    localStorage.setItem("adminpro_user", JSON.stringify(fullUser));
    return { success: true, ...fullUser };
  }
  return res;
};

// ── USUARIOS ──
export const getUsers = async () => (await queryTurso("SELECT * FROM usuarios ORDER BY nombre ASC"))[0] || [];
export const crearUsuario = (d) => queryTurso({ sql: "INSERT INTO usuarios (email, password, nombre, rol, estado) VALUES (?,?,?,?,?)", args: mapArgs(d) });
export const actualizarUsuario = (oldEmail, newEmail, d) => queryTurso({ sql: "UPDATE usuarios SET email=?, password=?, nombre=?, rol=?, estado=? WHERE email=?", args: [{ type: "text", value: newEmail }, ...mapArgs(d), { type: "text", value: oldEmail }] });
export const eliminarUsuario = (email) => queryTurso({ sql: "DELETE FROM usuarios WHERE email = ?", args: [{ type: "text", value: email }] });

// ── CLIENTES ──
export const getClientes = async () => {
  const results = await queryTurso("SELECT * FROM clientes ORDER BY nombre ASC");
  return (results[0] || []).map(c => ({
    ...c,
    cedula: c.id
  }));
};
export const crearCliente = (d) => queryTurso({ sql: "INSERT INTO clientes VALUES (?,?,?,?,?,?,?)", args: mapArgs([d.cedula, d.nombre, d.telefono, d.direccion, d.email, d.tipo, new Date().toISOString()]) });
export const actualizarCliente = (id, d) => queryTurso({ sql: "UPDATE clientes SET id=?, nombre=?, telefono=?, direccion=?, email=?, tipo=? WHERE id=?", args: [...mapArgs([d.cedula, d.nombre, d.telefono, d.direccion, d.email, d.tipo]), { type: "text", value: id }] });
export const eliminarCliente = (id) => queryTurso({ sql: "DELETE FROM clientes WHERE id = ?", args: [{ type: "text", value: id }] });

// ── INVENTARIO ──
export const getInventario = async () => (await queryTurso("SELECT * FROM inventario ORDER BY id DESC"))[0].map(r => ({ ...r, stockActual: r.stock_actual, stockMinimo: r.stock_minimo, precioVenta: r.precio_venta, costo: r.costo }));
export const crearProducto = (d) => queryTurso({ sql: "INSERT INTO inventario VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", args: mapArgs(d) });
export const actualizarProducto = (id, d) => queryTurso({ sql: "UPDATE inventario SET id=?, nombre=?, marca=?, categoria=?, tipo=?, costo=?, precio_venta=?, stock_minimo=?, stock_actual=?, ubicacion=?, sku=?, imagen=? WHERE id=?", args: [...mapArgs(d), { type: "text", value: id }] });
export const eliminarProducto = (id) => queryTurso({ sql: "DELETE FROM inventario WHERE id = ?", args: [{ type: "text", value: id }] });

// ── EQUIPOS ──
export const getEquipos = async () => (await queryTurso("SELECT * FROM equipos"))[0] || [];
export const crearEquipo = (d) => queryTurso({ sql: "INSERT INTO equipos VALUES (?,?,?,?,?,?,?,?,?,?)", args: mapArgs(d) });
export const actualizarEquipo = (id, d) => queryTurso({ sql: "UPDATE equipos SET imei1=?, imei2=?, id_producto=?, marca=?, nombre=?, proveedor=?, costo=?, venta=?, estado=?, fecha_ingreso=? WHERE imei1=?", args: [...mapArgs(d), { type: "text", value: id }] });
export const eliminarEquipo = (id) => queryTurso({ sql: "DELETE FROM equipos WHERE imei1 = ?", args: [{ type: "text", value: id }] });

// ── VENTAS ──
export const getVentas = async () => (await queryTurso("SELECT * FROM ventas ORDER BY fecha DESC"))[0] || [];
export const registrarVenta = async (v) => {
  const idFac = `FAC-${Date.now()}`;
  const now = new Date().toISOString();
  await queryTurso([
    { 
      sql: "INSERT INTO ventas VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", 
      args: [
        {type:"text", value:idFac}, 
        {type:"text", value:now}, 
        {type:"text", value:v.cedula || ""}, 
        {type:"text", value:v.cliente || ""}, 
        {type:"text", value:v.direccion || ""}, 
        {type:"text", value:v.productoNombre || ""}, 
        {type:"text", value:String(v.total || 0)}, 
        {type:"text", value:"1"}, 
        {type:"text", value:v.imei || "N/A"}, 
        {type:"float", value:v.subtotal || 0}, 
        {type:"float", value:v.descuento || 0}, 
        {type:"float", value:v.total || 0}, 
        {type:"text", value:v.metodo || ""}, 
        {type:"text", value:v.vendedor || ""}, 
        {type:"text", value:""}, 
        {type:"text", value:v.firmaComprador || ""}, 
        {type:"text", value:v.evidencia || ""}
      ] 
    },
    { sql: "UPDATE inventario SET stock_actual = stock_actual - 1 WHERE id = ?", args: [{ type: "text", value: v.productoId || "" }] }
  ]);
  return { success: true, idFactura: idFac };
};

// ── CRÉDITOS ──
export const getCreditos = async () => (await queryTurso("SELECT * FROM creditos"))[0].map(r => ({ ...r, id: r.id_credito, idFactura: r.id_factura_ref, abonado: r.total_abonado, saldo: r.saldo_pendiente, total: r.valor_total }));
export const crearCredito = (d) => queryTurso({ sql: "INSERT INTO creditos (id_credito, cliente, telefono, id_factura_ref, fecha_deuda, tipo, valor_total, total_abonado, saldo_pendiente, estado, detalle) VALUES (?,?,?,?,?,?,?,?,?,?,?)", args: mapArgs([Date.now().toString(), d.cliente, d.telefono, d.idFactura, new Date().toISOString(), d.tipo||'Crédito', d.total, 0, d.total, 'Activo', d.detalle]) });
export const actualizarCredito = (id, d) => queryTurso({ sql: "UPDATE creditos SET id_credito=?, cliente=?, telefono=?, id_factura_ref=?, fecha_deuda=?, tipo=?, valor_total=?, total_abonado=?, saldo_pendiente=?, estado=?, fecha_cancelacion=?, detalle=?, historial_abonos=? WHERE id_credito=?", args: [...mapArgs(d), { type: "text", value: id }] });

// ── REVENTAS ──
export const getReventas = async () => (await queryTurso("SELECT * FROM reventas ORDER BY fecha DESC"))[0].map(r => ({ ...r, id: r.id_reventa, producto: r.producto, costo: r.costo_proveedor, precio: r.precio_venta, utilidad: r.utilidad }));
export const crearReventa = (d) => queryTurso({ sql: "INSERT INTO reventas VALUES (?,?,?,?,?,?,?,?)", args: mapArgs([`REV-${Date.now()}`, new Date().toISOString(), d.producto, d.categoria, d.costo, d.precio, d.proveedor, d.precio - d.costo]) });
export const actualizarReventa = (id, d) => queryTurso({ sql: "UPDATE reventas SET id_reventa=?, fecha=?, producto=?, categoria=?, costo_proveedor=?, precio_venta=?, proveedor=?, utilidad=? WHERE id_reventa=?", args: [...mapArgs(d), { type: "text", value: id }] });
export const eliminarReventa = (id) => queryTurso({ sql: "DELETE FROM reventas WHERE id_reventa = ?", args: [{ type: "text", value: id }] });

// ── SERVICIO TÉCNICO ──
export const getTechnical = async () => (await queryTurso("SELECT * FROM servicio_tecnico ORDER BY id_orden DESC"))[0] || [];
export const crearServicioTecnico = (d) => queryTurso({ sql: "INSERT INTO servicio_tecnico VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", args: mapArgs(d) });
export const actualizarServicioTecnico = (id, d) => queryTurso({ sql: "UPDATE servicio_tecnico SET id_orden=?, cliente=?, telefono=?, equipo=?, imei_serie=?, falla=?, clave_patron=?, repuestos=?, costo_taller=?, abono=?, precio_final=?, estado=?, evidencias=? WHERE id_orden=?", args: [...mapArgs(d), { type: "text", value: id }] });
export const eliminarServicioTecnico = (id) => queryTurso({ sql: "DELETE FROM servicio_tecnico WHERE id_orden = ?", args: [{ type: "text", value: id }] });

// ── DASHBOARD ──
export const getDashboard = async () => {
  const res = await queryTurso(["SELECT COUNT(*) as c FROM inventario", "SELECT COUNT(*) as c FROM clientes", "SELECT SUM(total) as s FROM ventas WHERE date(fecha) = date('now')", "SELECT SUM(monto) as s FROM egresos WHERE date(fecha) = date('now')", "SELECT SUM(stock_actual) as s FROM inventario", "SELECT COUNT(*) as c FROM inventario WHERE stock_actual <= 1", "SELECT * FROM ventas ORDER BY fecha DESC LIMIT 8", "SELECT date(fecha) as d, SUM(total) as m FROM ventas WHERE date(fecha) >= date('now','-7 days') GROUP BY d", "SELECT COUNT(*) as c FROM equipos", "SELECT productos, COUNT(*) as qty FROM ventas GROUP BY productos ORDER BY qty DESC LIMIT 5", "SELECT id, nombre, stock_actual, stock_minimo FROM inventario WHERE stock_actual <= 1 LIMIT 5", "SELECT id_orden, cliente, equipo, estado FROM servicio_tecnico ORDER BY id_orden DESC LIMIT 5", "SELECT COUNT(*) as c FROM creditos WHERE estado != 'Pagado' AND estado != 'Cancelado'", "SELECT COUNT(*) as c FROM reventas"]);
  const labels7d = []; const ventas7d = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i); const iso = d.toISOString().slice(0,10);
    labels7d.push(d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }));
    const day = (res[7] || []).find(x => x.d === iso); ventas7d.push(day ? day.m : 0);
  }
  return { ingresosHoy: res[2]?.[0]?.s||0, egresosHoy: res[3]?.[0]?.s||0, utilidad: (res[2]?.[0]?.s||0)-(res[3]?.[0]?.s||0), totalProductos: res[0]?.[0]?.c||0, totalClientes: res[1]?.[0]?.c||0, totalStock: res[4]?.[0]?.s||0, stockCritico: res[5]?.[0]?.c||0, totalEquipos: res[8]?.[0]?.c||0, ventasRecientes: res[6]||[], topProductos: (res[9]||[]).map(p=>({nombre:p.productos, cantidad:p.qty})), productosBajoStock: (res[10]||[]).map(p=>({...p, stockActual: p.stock_actual})), tecRecientes: res[11]||[], creditosActivos: res[12]?.[0]?.c||0, totalReventas: res[13]?.[0]?.c||0, labels7d, ventas7d };
};

// ── EGRESOS ──
export const getEgresos = async () => {
  const results = await queryTurso("SELECT * FROM egresos ORDER BY fecha DESC");
  return (results[0] || []).map(e => ({
    ...e,
    id: e.id_gasto // Mapeamos id_gasto de Turso a id para el frontend
  }));
};
export const registrarEgreso = (d) => queryTurso({ sql: "INSERT INTO egresos VALUES (?,?,?,?,?,?,?)", args: mapArgs([`EGR-${Date.now()}`, new Date().toISOString(), d.categoria, d.concepto, d.responsable, d.monto, '']) });
export const getVendedores = async () => (await queryTurso("SELECT nombre, email FROM usuarios WHERE rol != 'Cliente'"))[0] || [];

// ── NÓMINAS ──
export const getNominas = async () => {
  const results = await queryTurso("SELECT * FROM nominas ORDER BY fecha DESC");
  return (results[0] || []).map(n => ({
    ...n,
    id: n.id_nomina
  }));
};
export const crearNomina = (d) => queryTurso({ sql: "INSERT INTO nominas VALUES (?,?,?,?,?,?,?,?,?,?)", args: mapArgs([`NOM-${Date.now()}`, d.fecha || new Date().toISOString(), d.empleado, d.periodo, d.salario_base, d.deducciones, d.bonificaciones, d.total_pagar, d.estado || 'Pendiente', d.notas || '']) });
export const actualizarNomina = (id, d) => queryTurso({ sql: "UPDATE nominas SET fecha=?, empleado=?, periodo=?, salario_base=?, deducciones=?, bonificaciones=?, total_pagar=?, estado=?, notas=? WHERE id_nomina=?", args: [...mapArgs([d.fecha, d.empleado, d.periodo, d.salario_base, d.deducciones, d.bonificaciones, d.total_pagar, d.estado, d.notas]), { type: "text", value: id }] });
export const eliminarNomina = (id) => queryTurso({ sql: "DELETE FROM nominas WHERE id_nomina = ?", args: [{ type: "text", value: id }] });


// ── TAREAS ──
export const getTareas = async () => (await queryTurso("SELECT * FROM tareas ORDER BY date(fecha_vencimiento) ASC"))[0] || [];
export const crearTarea = (t) => queryTurso({ sql: "INSERT INTO tareas VALUES (?,?,?,?,?,?,?,?,?)", args: mapArgs([`T-${Date.now()}`, t.tarea, t.fecha_inicio, t.fecha_vencimiento, t.prioridad, t.estado||'Pendiente', t.responsable, t.notas||'', t.color||'#4f46e5']) });
export const updateTareaEstado = (id, est) => queryTurso({ sql: "UPDATE tareas SET estado = ? WHERE id = ?", args: [{type:"text", value:est}, {type:"text", value:id}] });
export const eliminarTarea = (id) => queryTurso({ sql: "DELETE FROM tareas WHERE id = ?", args: [{type:"text", value:id}] });
