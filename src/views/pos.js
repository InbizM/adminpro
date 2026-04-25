import { getInventario, registrarVenta } from "../api.js";
import { showToast } from "../toast.js";
import { openScanner } from "../scanner.js";

let _productos = [];
let _carrito = [];
let _isLoaded = false;
let _isProcessing = false;

// UI Elements
let elSearch, elGrid, elCartItems, elSubtotal, elDescuento, elTotal, elBtnPay, elClienteDoc, elClienteNombre;
// Modal
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
    elGrid.innerHTML = `<p class="text-on-surface-variant p-4">Cargando productos...</p>`;
    const data = await getInventario();
    _productos = data.filter(p => p.stockActual > 0);
  } catch (err) {
    showToast("Error cargando productos", "error");
    _productos = [];
  }
}

function renderProductos(lista) {
  if (lista.length === 0) {
    elGrid.innerHTML = `<p class="text-on-surface-variant p-4 col-span-full text-center">No hay productos disponibles.</p>`;
    return;
  }

  elGrid.innerHTML = lista.map(p => {
    const precio = new Intl.NumberFormat("es-CO").format(p.precioVenta || 0);
    const hasImg = !!p.imagen;
    return `
      <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-3 flex flex-col gap-2 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
           onclick="window.posAddToCart('${p.id}')">
        <div class="w-full aspect-square rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
          ${hasImg 
            ? `<img src="${p.imagen}" class="w-full h-full object-cover" loading="lazy" />` 
            : `<span class="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>`
          }
        </div>
        <div class="flex-1 flex flex-col">
          <p class="text-[10px] text-primary font-bold tracking-wider uppercase mb-0.5 truncate">${p.marca || 'Genérico'}</p>
          <h3 class="text-xs font-bold text-on-surface leading-tight line-clamp-2 flex-1">${p.nombre}</h3>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-surface-variant">
            <span class="text-sm font-black text-on-surface">$${precio}</span>
            <span class="text-[10px] font-medium bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">Stock: ${p.stockActual}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function setupEvents() {
  // Búsqueda en tiempo real
  elSearch.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) return renderProductos(_productos);
    
    const filtrados = _productos.filter(p => 
      p.nombre.toLowerCase().includes(term) || 
      p.sku.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      (p.marca && p.marca.toLowerCase().includes(term))
    );
    renderProductos(filtrados);
  });

  // Scanner button
  document.getElementById("pos-scan-btn")?.addEventListener("click", () => {
    openScanner({
      title: "Escanear Producto",
      onScan: (code) => {
        // Try to find product by SKU, ID, or name match
        const prod = _productos.find(p => 
          p.sku === code || p.id === code || 
          p.sku?.toLowerCase() === code.toLowerCase() ||
          p.id?.toLowerCase() === code.toLowerCase()
        );
        if (prod) {
          window.posAddToCart(prod.id);
          showToast(`✅ ${prod.nombre} agregado al carrito`, "success");
        } else {
          // Put it in the search bar so user can see results
          elSearch.value = code;
          elSearch.dispatchEvent(new Event("input"));
          showToast(`Código: ${code} — buscando...`, "info");
        }
      }
    });
  });

  // Escucha el evento global para añadir al carrito
  window.posAddToCart = (id) => {
    const prod = _productos.find(p => p.id === id);
    if (!prod) return;

    const exist = _carrito.find(item => item.id === id);
    if (exist) {
      if (exist.qty >= prod.stockActual) {
        showToast("Stock máximo alcanzado para este producto", "warning");
        return;
      }
      exist.qty++;
    } else {
      _carrito.push({ ...prod, qty: 1 });
    }
    renderCarrito();
  };

  window.posRemoveItem = (id) => {
    _carrito = _carrito.filter(item => item.id !== id);
    renderCarrito();
  };

  window.posUpdateQty = (id, delta) => {
    const item = _carrito.find(i => i.id === id);
    if (!item) return;
    const prod = _productos.find(p => p.id === id);

    item.qty += delta;
    if (item.qty <= 0) {
      posRemoveItem(id);
    } else if (item.qty > prod.stockActual) {
      item.qty = prod.stockActual;
      showToast("Stock máximo alcanzado", "warning");
    }
    renderCarrito();
  };

  elDescuento.addEventListener("input", renderCarrito);

  elBtnPay.addEventListener("click", () => {
    if (_carrito.length === 0) return showToast("El carrito está vacío", "warning");
    if (!elClienteNombre.value) return showToast("Ingresa el nombre del cliente", "warning");
    openCheckoutModal();
  });

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

  let subtotal = 0;
  elCartItems.innerHTML = _carrito.map(item => {
    const totalItem = item.precioVenta * item.qty;
    subtotal += totalItem;
    return `
      <div class="bg-white border border-surface-variant rounded-xl p-3 flex gap-3 shadow-sm">
        <div class="flex-1 flex flex-col justify-between">
          <p class="text-xs font-bold text-on-surface line-clamp-2">${item.nombre}</p>
          <p class="text-[11px] text-on-surface-variant font-medium mt-1">
            $${new Intl.NumberFormat("es-CO").format(item.precioVenta)} x ${item.qty}
          </p>
        </div>
        <div class="flex flex-col items-end justify-between">
          <button onclick="window.posRemoveItem('${item.id}')" class="text-error/70 hover:text-error p-1">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
          <div class="flex items-center gap-2 bg-surface-container rounded-lg p-0.5">
            <button onclick="window.posUpdateQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-on-surface hover:text-primary"><span class="material-symbols-outlined text-[16px]">remove</span></button>
            <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
            <button onclick="window.posUpdateQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-on-surface hover:text-primary"><span class="material-symbols-outlined text-[16px]">add</span></button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const desc = parseFloat(elDescuento.value) || 0;
  const total = Math.max(0, subtotal - desc);

  elSubtotal.textContent = `$${new Intl.NumberFormat("es-CO").format(subtotal)}`;
  elTotal.textContent = `$${new Intl.NumberFormat("es-CO").format(total)}`;
}

// ==========================================
// MODAL & CANVAS LOGIC
// ==========================================

function setupCanvas() {
  ctx = elCanvas.getContext("2d");
  let isDrawing = false;

  const getPos = (e) => {
    const rect = elCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (elCanvas.width / rect.width),
      y: (clientY - rect.top) * (elCanvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    isDrawing = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDraw = () => { isDrawing = false; };

  elCanvas.addEventListener("mousedown", startDraw);
  elCanvas.addEventListener("mousemove", draw);
  elCanvas.addEventListener("mouseup", stopDraw);
  elCanvas.addEventListener("mouseout", stopDraw);
  
  elCanvas.addEventListener("touchstart", startDraw, { passive: false });
  elCanvas.addEventListener("touchmove", draw, { passive: false });
  elCanvas.addEventListener("touchend", stopDraw);

  // Botón limpiar
  elCanvas.nextElementSibling.addEventListener("click", () => {
    ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
  });
}

function openCheckoutModal() {
  elModal.classList.remove("hidden");
  elModal.classList.add("flex");
  
  // Set real pixel dimensions for canvas when shown
  const rect = elCanvas.getBoundingClientRect();
  elCanvas.width = rect.width;
  elCanvas.height = rect.height;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1a1c1e";
  ctx.lineCap = "round";
  ctx.clearRect(0, 0, elCanvas.width, elCanvas.height);
}

function closeCheckoutModal() {
  elModal.classList.add("hidden");
  elModal.classList.remove("flex");
}

function isCanvasEmpty() {
  const blank = document.createElement("canvas");
  blank.width = elCanvas.width;
  blank.height = elCanvas.height;
  return elCanvas.toDataURL() === blank.toDataURL();
}

async function procesarVenta() {
  if (_isProcessing) return;
  _isProcessing = true;
  elModalConfirm.textContent = "Procesando...";
  elModalConfirm.disabled = true;

  try {
    const subtotalStr = elSubtotal.textContent.replace(/[^0-9]/g, '');
    const totalStr = elTotal.textContent.replace(/[^0-9]/g, '');
    
    // Nombres de los productos en string para la bd
    const prodNames = _carrito.map(i => `${i.nombre} (x${i.qty})`).join(", ");
    
    // Objeto para registrar la venta
    const ventaData = {
      cedula: elClienteDoc.value.trim(),
      cliente: elClienteNombre.value.trim() || "Consumidor Final",
      productoNombre: prodNames,
      productoId: _carrito[0]?.id || "", // Para simplificar asume que descontamos el primer producto (en una app real es un array)
      subtotal: parseInt(subtotalStr) || 0,
      descuento: parseInt(elDescuento.value) || 0,
      total: parseInt(totalStr) || 0,
      metodo: document.getElementById("pos-metodo-pago").value
    };

    // Agregar firma base64 si dibujó algo
    if (!isCanvasEmpty()) {
      ventaData.firmaComprador = elCanvas.toDataURL("image/png");
    }

    // TODO: Manejar la evidencia fotográfica enviándola como base64

    // Por ahora la API actual asume un objeto ventaData. 
    // Vamos a usar registrarVenta() que llama a doPost
    const res = await registrarVenta(ventaData);
    
    if (res && res.success) {
      showToast("Venta registrada exitosamente", "success");
      
      // Limpiar todo
      _carrito = [];
      renderCarrito();
      elClienteDoc.value = "";
      elClienteNombre.value = "";
      elDescuento.value = "0";
      closeCheckoutModal();
      
      // Recargar stock en background
      loadProductos().then(() => renderProductos(_productos));
    } else {
      showToast(res?.mensaje || "Error al registrar la venta", "error");
    }

  } catch (err) {
    showToast("Error de conexión: " + err.message, "error");
  } finally {
    _isProcessing = false;
    elModalConfirm.textContent = "Confirmar y Facturar";
    elModalConfirm.disabled = false;
  }
}
