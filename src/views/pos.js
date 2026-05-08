import { getInventario, registrarVenta, crearCredito, uploadFoto, uploadSignature, uploadEvidencia } from "../api.js";
import { showToast } from "../toast.js";
import { openScanner } from "../scanner.js";
import { openCustomerSelector } from "../customer-selector.js";

let _productos = [];
let _carrito = [];
let _isLoaded = false;
let _isProcessing = false;
let _tipoVenta = null;

let elSearch, elGrid, elCartItems, elSubtotal, elDescuento, elTotal, elBtnPay, elClienteDoc, elClienteNombre;
let elModal, elModalClose, elModalCancel, elModalConfirm, elFile, elCanvas, ctx;

export function initPOS() {
  return async () => {
    bindUIElements();
    if (!_isLoaded) {
      await loadProductos();
      setupEvents();
      setupCanvas();
      _isLoaded = true;
    }
    renderProductos(_productos);
    renderCarrito();
  };
}

function bindUIElements() {
  elSearch = document.getElementById("pos-search");
  elGrid = document.getElementById("pos-products-grid");
  elCartItems = document.getElementById("pos-cart-items");
  elSubtotal = document.getElementById("pos-subtotal");
  elDescuento = document.getElementById("pos-descuento");
  elTotal = document.getElementById("pos-total");
  elBtnPay = document.getElementById("pos-pay-btn");
  elClienteDoc = document.getElementById("pos-cliente-doc");
  elClienteNombre = document.getElementById("pos-cliente-nombre");
  elModal = document.getElementById("pos-checkout-modal");
  elModalClose = document.getElementById("pos-checkout-close");
  elModalCancel = document.getElementById("pos-checkout-cancel");
  elModalConfirm = document.getElementById("pos-checkout-confirm");
  elFile = document.getElementById("pos-evidencia-file");
  elCanvas = document.getElementById("pos-canvas-cliente");
}

async function loadProductos() {
  try {
    const data = await getInventario();
    _productos = data.filter(p => p.stockActual > 0);
  } catch (err) { _productos = []; }
}

function renderProductos(lista) {
  if (lista.length === 0) { elGrid.innerHTML = `<p class="p-4 col-span-full text-center opacity-50 italic text-sm">Sin stock disponible</p>`; return; }
  elGrid.innerHTML = lista.map(p => `
    <div onclick="window.posAddToCart('${p.id}')" 
      class="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:border-primary hover:shadow-xl transition-all active:scale-95 shadow-sm group h-[240px]">
      <div class="h-36 w-full bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden border-b border-slate-100">
        ${p.imagen ? 
          `<img src="${p.imagen}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />` : 
          `<span class="material-symbols-outlined text-slate-300 text-[40px]">image</span>`}
      </div>
      <div class="p-4 flex flex-col justify-between flex-1 min-w-0 bg-white">
        <h3 class="text-xs font-black text-slate-800 leading-tight line-clamp-2 uppercase group-hover:text-primary transition-colors">${p.nombre}</h3>
        <div class="flex justify-between items-center mt-auto">
          <span class="text-[10px] font-black text-primary px-2.5 py-1 bg-primary/10 rounded-full truncate max-w-[65%]">${p.marca || 'GENERICO'}</span>
          <div class="flex flex-col items-end">
            <span class="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">Stock</span>
            <span class="text-xs font-black text-slate-900">${p.stockActual}</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

function setupEvents() {
  elSearch.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderProductos(q ? _productos.filter(p => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : _productos);
  });

  // Physical Barcode Scanner Support (Global Event)
  document.addEventListener("barcodeScanned", (e) => {
    // Verificar que estamos en la vista del POS
    const posView = document.querySelector('[data-view="pos"]');
    if (!posView || posView.classList.contains('hidden')) return;

    const code = e.detail;
    const prod = _productos.find(p => p.sku === code || p.id === code);
    if (prod) { 
      window.posAddToCart(prod.id); 
      showToast(`✅ ${prod.nombre} agregado`, "success"); 
      
      // Limpiar buscador si estaba enfocado
      if (document.activeElement === elSearch) {
        elSearch.value = "";
        renderProductos(_productos);
        elSearch.blur(); // Quitar el foco para evitar problemas de tipeo
      }
    } else {
      showToast(`Código ${code} no encontrado`, "warning");
    }
  });

  document.getElementById("pos-scan-btn")?.addEventListener("click", () => {
    openScanner({ title: "Escanear", onScan: (code) => {
      const prod = _productos.find(p => p.sku === code || p.id === code);
      if (prod) { window.posAddToCart(prod.id); showToast(`✅ ${prod.nombre} agregado`, "success"); }
    }});
  });

  document.getElementById("pos-select-client-btn")?.addEventListener("click", () => {
    openCustomerSelector((client) => {
      elClienteNombre.value = client.nombre;
      elClienteDoc.value = client.documento;
    });
  });

  window.posAddToCart = (id) => {
    const p = _productos.find(x => x.id === id);
    if (!p) return;
    const exist = _carrito.find(i => i.id === id);
    if (exist) { 
      if (exist.qty >= p.stockActual) return showToast("Sin stock", "warning"); 
      exist.qty++; 
    }
    else { 
      _carrito.push({ ...p, qty: 1, precioManual: 0 }); 
    }
    renderCarrito();
    // Opcional: enfocar el último input de precio agregado
    setTimeout(() => {
      const inputs = elCartItems.querySelectorAll('input[oninput*="posUpdatePrice"]');
      if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 100);
  };

  window.posRemoveItem = (id) => { _carrito = _carrito.filter(i => i.id !== id); renderCarrito(); };
  window.posUpdateQty = (id, delta) => {
    const i = _carrito.find(x => x.id === id);
    const p = _productos.find(x => x.id === id);
    if (i) { 
      i.qty += delta; 
      if (i.qty <= 0) window.posRemoveItem(id); 
      else if (i.qty > p.stockActual) i.qty = p.stockActual; 
      renderCarrito(); 
    }
  };
  window.posUpdatePrice = (id, el) => {
    const i = _carrito.find(x => x.id === id);
    const num = Number(el.value.replace(/\D/g, ""));
    if (i) { 
      i.precioManual = num; 
      el.value = new Intl.NumberFormat('es-CO').format(num); 
      updateTotalsOnly(); 
    }
  };

  elDescuento.addEventListener("input", renderCarrito);
  const openCheckout = (t) => { if (_carrito.length === 0) return; if (!elClienteNombre.value) return showToast("Nombre cliente ok?", "warning"); _tipoVenta = t; openCheckoutModal(); };
  document.getElementById("pos-pay-btn-venta")?.addEventListener("click", () => openCheckout("venta"));
  document.getElementById("pos-pay-btn-credito")?.addEventListener("click", () => openCheckout("credito"));
  document.getElementById("pos-pay-btn-separe")?.addEventListener("click", () => openCheckout("separe"));

  elModalClose.addEventListener("click", closeCheckoutModal);
  elModalCancel.addEventListener("click", closeCheckoutModal);
  elModalConfirm.addEventListener("click", procesarVenta);
}

function renderCarrito() {
  if (_carrito.length === 0) { 
    elCartItems.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant/50">
        <span class="material-symbols-outlined text-5xl mb-2" style="font-variation-settings:'FILL' 1">shopping_cart</span>
        <p class="text-sm font-medium">El carrito está vacío</p>
      </div>`; 
    updateTotals(0); 
    return; 
  }
  let sub = 0;
  elCartItems.innerHTML = _carrito.map(i => {
    const p = i.precioManual || 0;
    sub += p * i.qty;
    return `
    <div class="bg-white border-2 ${p === 0 ? 'border-orange-400 animate-pulse' : 'border-slate-100'} p-3 rounded-2xl flex gap-3 shadow-sm transition-all">
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-black text-slate-800 truncate mb-1 uppercase">${i.nombre}</p>
        <div class="flex items-center bg-slate-50 rounded-lg px-2 border border-slate-200 focus-within:border-primary transition-colors">
          <span class="text-xs font-bold text-slate-400">$</span>
          <input type="text" 
            value="${p === 0 ? '' : new Intl.NumberFormat('es-CO').format(p)}" 
            placeholder="0"
            oninput="window.posUpdatePrice('${i.id}', this)" 
            class="w-full py-1.5 px-1 text-sm font-black text-primary bg-transparent outline-none placeholder:text-slate-300" />
        </div>
      </div>
      <div class="flex flex-col justify-between items-end">
        <button onclick="window.posRemoveItem('${i.id}')" class="text-slate-300 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
        <div class="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button onclick="window.posUpdateQty('${i.id}', -1)" class="w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all text-slate-600 font-bold">-</button>
          <span class="text-xs font-black w-5 text-center text-slate-700">${i.qty}</span>
          <button onclick="window.posUpdateQty('${i.id}', 1)" class="w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all text-slate-600 font-bold">+</button>
        </div>
      </div>
    </div>`;
  }).join("");
  updateTotals(sub);
}

function updateTotalsOnly() {
  let s = 0; _carrito.forEach(i => s += (i.precioManual || i.precioVenta || 0) * i.qty);
  updateTotals(s);
}

function updateTotals(s) {
  const d = parseFloat(elDescuento.value) || 0;
  elSubtotal.textContent = `$${new Intl.NumberFormat('es-CO').format(s)}`;
  elTotal.textContent = `$${new Intl.NumberFormat('es-CO').format(Math.max(0, s-d))}`;
}

function setupCanvas() {
  ctx = elCanvas.getContext("2d");
  const getPos = (e) => {
    const r = elCanvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: x * (elCanvas.width / r.width), y: y * (elCanvas.height / r.height) };
  };
  let drawing = false;
  const start = (e) => { drawing = true; ctx.beginPath(); const {x,y} = getPos(e); ctx.moveTo(x,y); e.preventDefault(); };
  const move = (e) => { if(!drawing) return; const {x,y} = getPos(e); ctx.lineTo(x,y); ctx.stroke(); e.preventDefault(); };
  elCanvas.addEventListener("mousedown", start); elCanvas.addEventListener("mousemove", move);
  elCanvas.addEventListener("mouseup", () => drawing = false);
  elCanvas.addEventListener("touchstart", start, {passive:false}); elCanvas.addEventListener("touchmove", move, {passive:false});
  elCanvas.addEventListener("touchend", () => drawing = false);
  elCanvas.nextElementSibling.addEventListener("click", () => ctx.clearRect(0,0,elCanvas.width,elCanvas.height));
}

function openCheckoutModal() { elModal.classList.remove("hidden"); elModal.classList.add("flex"); elCanvas.width = elCanvas.offsetWidth; elCanvas.height = elCanvas.offsetHeight; ctx.lineWidth=2; ctx.lineCap='round'; ctx.clearRect(0,0,elCanvas.width,elCanvas.height); }
function closeCheckoutModal() { elModal.classList.add("hidden"); elModal.classList.remove("flex"); }

async function procesarVenta() {
  if (_isProcessing) return;
  _isProcessing = true;
  elModalConfirm.textContent = "Subiendo archivos...";
  elModalConfirm.disabled = true;

  try {
    let firmaUrl = "";
    let evidenciaUrl = "";

    // 1. SUBIR FIRMA A DRIVE
    const blank = document.createElement("canvas"); blank.width = elCanvas.width; blank.height = elCanvas.height;
    if (elCanvas.toDataURL() !== blank.toDataURL()) {
      const resSig = await uploadSignature(elCanvas.toDataURL("image/png"), `Firma_${Date.now()}.png`);
      firmaUrl = typeof resSig === 'string' ? resSig : (resSig?.url || "");
    }

    // 2. SUBIR EVIDENCIA A DRIVE
    if (elFile.files[0]) {
      elModalConfirm.textContent = "Subiendo evidencia...";
      const file = elFile.files[0];
      const base64 = await new Promise(r => { const rd = new FileReader(); rd.onload = e => r(e.target.result); rd.readAsDataURL(file); });
      const resImg = await uploadEvidencia(base64, file.name, file.type);
      evidenciaUrl = typeof resImg === 'string' ? resImg : (resImg?.url || "");
    }

    // 3. REGISTRAR EN TURSO
    elModalConfirm.textContent = "Registrando venta...";
    const sub = Number(elSubtotal.textContent.replace(/\D/g, ""));
    const tot = Number(elTotal.textContent.replace(/\D/g, ""));
    const user = JSON.parse(localStorage.getItem("adminpro_user") || "{}");

    const ventaData = {
      cedula: elClienteDoc.value.trim(),
      cliente: elClienteNombre.value.trim(),
      productoNombre: _carrito.map(i => `${i.nombre} (x${i.qty})`).join(", "),
      productoId: _carrito[0]?.id,
      subtotal: sub,
      descuento: Number(elDescuento.value) || 0,
      total: tot,
      metodo: document.getElementById("pos-metodo-pago").value,
      vendedor: user.nombre || "Vendedor",
      firmaComprador: firmaUrl, // Link de Drive
      evidencia: evidenciaUrl // Link de Drive
    };

    const res = await registrarVenta(ventaData);
    if (res.success) {
      if (_tipoVenta !== "venta") {
        await crearCredito({ cliente: ventaData.cliente, telefono: ventaData.cedula, idFactura: res.idFactura, total: tot, detalle: ventaData.productoNombre, tipo: _tipoVenta === "separe" ? "Plan Separe" : "Crédito" });
      }
      showToast("Venta Exitosa", "success");
      _carrito = []; renderCarrito(); elClienteDoc.value=""; elClienteNombre.value=""; closeCheckoutModal();
      loadProductos().then(() => renderProductos(_productos));
    } else {
      showToast("Error al guardar", "error");
    }
  } catch (err) { showToast(err.message, "error"); }
  finally { _isProcessing = false; elModalConfirm.textContent = "Confirmar y Facturar"; elModalConfirm.disabled = false; }
}
