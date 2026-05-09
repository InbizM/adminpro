(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={},t=null,n=null;function r(t,n){e[t]=n}function i(e){t=e}function a(e){n=e}async function o(r){if(n){let e=n(r);if(e===!1)return;typeof e==`string`&&(r=e)}document.querySelectorAll(`[data-view]`).forEach(e=>{e.classList.add(`hidden`)});let i=document.querySelector(`[data-view="${r}"]`);if(!i)return console.warn(`View not found:`,r);i.classList.remove(`hidden`),t&&t(r),e[r]&&await e[r]()}var s=`https://adminpro-adminpro.aws-us-west-2.turso.io/v2/pipeline`,c=`eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcyOTIwOTMsImlkIjoiMDE5ZGNlZGItOTIwMS03NGVkLWIwZGYtZjg4MTQ3NjlhODcxIiwicmlkIjoiNWIwMWViNTctYTgxYS00OTI0LWIzMDUtZjk1Y2EwMjUzNmRkIn0.oruUZmv_ZLWlKA2ctQnghAD5PIiJSIeR4nzbZia-q-f1r12IHhLv1hDw9CsReABIceaVRHPS52JMZ4j3lcZ1Bw`,l=`https://script.google.com/macros/s/AKfycbxxs-PUyNqqALN2-azEHaViv5PM1r5oteanvr2Sfydic-bBQJrGWj00R0FO7UAlP4Ug/exec`,u=localStorage.getItem(`adminpro_gas_token`)||``,d=e=>{u=e,localStorage.setItem(`adminpro_gas_token`,e)},f=()=>u,p=()=>{localStorage.clear(),location.reload()};async function m(e){let t=Array.isArray(e)?e.map(e=>typeof e==`string`?{type:`execute`,stmt:{sql:e}}:e.type?e:{type:`execute`,stmt:e}):[{type:`execute`,stmt:typeof e==`string`?{sql:e}:e}],n=await(await fetch(s,{method:`POST`,headers:{Authorization:`Bearer ${c}`,"Content-Type":`application/json`},body:JSON.stringify({requests:t})})).json();if(n.error)throw Error(n.error.message);return(n.results||[]).map(e=>{if(!e.response||!e.response.result)return[];let{cols:t,rows:n}=e.response.result;return n.map(e=>{let n={};return t.forEach((t,r)=>{n[t.name]=e[r].value}),n})})}var h=e=>e.map(e=>({type:typeof e==`number`?`float`:`text`,value:String(e)}));async function ee(e){return await(await fetch(l,{method:`POST`,mode:`cors`,body:JSON.stringify(e)})).json()}var te=async(e,t,n)=>(await ee({action:`uploadFoto`,token:u,base64Data:e,fileName:t,mimeType:n})).url||``,ne=async(e,t)=>(await ee({action:`uploadSignature`,token:u,base64Data:e,fileName:t})).url||``,re=async(e,t,n)=>(await ee({action:`uploadEvidencia`,token:u,base64Data:e,fileName:t,mimeType:n})).url||``,ie=async(e,t)=>{let n=await m({sql:`SELECT * FROM usuarios WHERE email = ? AND password = ? AND estado = 'Activo'`,args:[{type:`text`,value:e.toLowerCase()},{type:`text`,value:t}]});return!n[0]||n[0].length===0?{success:!1,mensaje:`Credenciales incorrectas`}:await(await fetch(`${l}?action=login&email=${encodeURIComponent(e)}&password=${t}`)).json()},ae=async(e,t)=>{let n=await(await fetch(`${l}?action=verifyPin&email=${encodeURIComponent(e)}&pin=${t}`)).json();if(n.success){d(n.token);let t={...(await m({sql:`SELECT nombre, rol, email FROM usuarios WHERE email = ?`,args:[{type:`text`,value:e.toLowerCase()}]}))[0]?.[0]||{nombre:`Usuario`},token:n.token};return localStorage.setItem(`adminpro_user`,JSON.stringify(t)),{success:!0,...t}}return n},oe=async()=>(await m(`SELECT * FROM usuarios ORDER BY nombre ASC`))[0]||[],se=e=>m({sql:`INSERT INTO usuarios (email, password, nombre, rol, estado) VALUES (?,?,?,?,?)`,args:h(e)}),ce=(e,t,n)=>m({sql:`UPDATE usuarios SET email=?, password=?, nombre=?, rol=?, estado=? WHERE email=?`,args:[{type:`text`,value:t},...h(n),{type:`text`,value:e}]}),le=e=>m({sql:`DELETE FROM usuarios WHERE email = ?`,args:[{type:`text`,value:e}]}),ue=async()=>((await m(`SELECT * FROM clientes ORDER BY nombre ASC`))[0]||[]).map(e=>({...e,cedula:e.id})),de=e=>m({sql:`INSERT INTO clientes VALUES (?,?,?,?,?,?,?)`,args:h([e.cedula,e.nombre,e.telefono,e.direccion,e.email,e.tipo,new Date().toISOString()])}),fe=(e,t)=>m({sql:`UPDATE clientes SET id=?, nombre=?, telefono=?, direccion=?, email=?, tipo=? WHERE id=?`,args:[...h([t.cedula,t.nombre,t.telefono,t.direccion,t.email,t.tipo]),{type:`text`,value:e}]}),pe=e=>m({sql:`DELETE FROM clientes WHERE id = ?`,args:[{type:`text`,value:e}]}),me=async()=>(await m(`SELECT * FROM inventario ORDER BY id DESC`))[0].map(e=>({...e,stockActual:e.stock_actual,stockMinimo:e.stock_minimo,precioVenta:e.precio_venta,costo:e.costo})),he=e=>m({sql:`INSERT INTO inventario VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,args:h(e)}),ge=(e,t)=>m({sql:`UPDATE inventario SET id=?, nombre=?, marca=?, categoria=?, tipo=?, costo=?, precio_venta=?, stock_minimo=?, stock_actual=?, ubicacion=?, sku=?, imagen=? WHERE id=?`,args:[...h(t),{type:`text`,value:e}]}),_e=e=>m({sql:`DELETE FROM inventario WHERE id = ?`,args:[{type:`text`,value:e}]}),ve=async()=>(await m(`SELECT * FROM equipos`))[0]||[],ye=e=>m({sql:`INSERT INTO equipos VALUES (?,?,?,?,?,?,?,?,?,?)`,args:h(e)}),be=(e,t)=>m({sql:`UPDATE equipos SET imei1=?, imei2=?, id_producto=?, marca=?, nombre=?, proveedor=?, costo=?, venta=?, estado=?, fecha_ingreso=? WHERE imei1=?`,args:[...h(t),{type:`text`,value:e}]}),xe=e=>m({sql:`DELETE FROM equipos WHERE imei1 = ?`,args:[{type:`text`,value:e}]}),Se=async()=>(await m(`SELECT * FROM ventas ORDER BY fecha DESC`))[0]||[],Ce=async e=>{let t=`FAC-${Date.now()}`,n=new Date().toISOString();return await m([{sql:`INSERT INTO ventas VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,args:[{type:`text`,value:t},{type:`text`,value:n},{type:`text`,value:e.cedula||``},{type:`text`,value:e.cliente||``},{type:`text`,value:e.direccion||``},{type:`text`,value:e.productoNombre||``},{type:`text`,value:String(e.total||0)},{type:`text`,value:`1`},{type:`text`,value:e.imei||`N/A`},{type:`float`,value:e.subtotal||0},{type:`float`,value:e.descuento||0},{type:`float`,value:e.total||0},{type:`text`,value:e.metodo||``},{type:`text`,value:e.vendedor||``},{type:`text`,value:``},{type:`text`,value:e.firmaComprador||``},{type:`text`,value:e.evidencia||``}]},{sql:`UPDATE inventario SET stock_actual = stock_actual - 1 WHERE id = ?`,args:[{type:`text`,value:e.productoId||``}]}]),{success:!0,idFactura:t}},we=async()=>(await m(`SELECT * FROM creditos`))[0].map(e=>({...e,id:e.id_credito,idFactura:e.id_factura_ref,abonado:e.total_abonado,saldo:e.saldo_pendiente,total:e.valor_total})),Te=e=>m({sql:`INSERT INTO creditos (id_credito, cliente, telefono, id_factura_ref, fecha_deuda, tipo, valor_total, total_abonado, saldo_pendiente, estado, detalle) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,args:h([Date.now().toString(),e.cliente,e.telefono,e.idFactura,new Date().toISOString(),e.tipo||`Crédito`,e.total,0,e.total,`Activo`,e.detalle])}),Ee=(e,t)=>m({sql:`UPDATE creditos SET id_credito=?, cliente=?, telefono=?, id_factura_ref=?, fecha_deuda=?, tipo=?, valor_total=?, total_abonado=?, saldo_pendiente=?, estado=?, fecha_cancelacion=?, detalle=?, historial_abonos=? WHERE id_credito=?`,args:[...h(t),{type:`text`,value:e}]}),De=async()=>(await m(`SELECT * FROM reventas ORDER BY fecha DESC`))[0].map(e=>({...e,id:e.id_reventa,producto:e.producto,costo:e.costo_proveedor,precio:e.precio_venta,utilidad:e.utilidad})),Oe=e=>m({sql:`INSERT INTO reventas VALUES (?,?,?,?,?,?,?,?)`,args:h([`REV-${Date.now()}`,new Date().toISOString(),e.producto,e.categoria,e.costo,e.precio,e.proveedor,e.precio-e.costo])}),ke=e=>m({sql:`DELETE FROM reventas WHERE id_reventa = ?`,args:[{type:`text`,value:e}]}),Ae=async()=>(await m(`SELECT * FROM servicio_tecnico ORDER BY id_orden DESC`))[0]||[],je=e=>m({sql:`INSERT INTO servicio_tecnico VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,args:h(e)}),Me=(e,t)=>m({sql:`UPDATE servicio_tecnico SET id_orden=?, cliente=?, telefono=?, equipo=?, imei_serie=?, falla=?, clave_patron=?, repuestos=?, costo_taller=?, abono=?, precio_final=?, estado=?, evidencias=? WHERE id_orden=?`,args:[...h(t),{type:`text`,value:e}]}),Ne=e=>m({sql:`DELETE FROM servicio_tecnico WHERE id_orden = ?`,args:[{type:`text`,value:e}]}),Pe=async()=>{let e=await m([`SELECT COUNT(*) as c FROM inventario`,`SELECT COUNT(*) as c FROM clientes`,`SELECT SUM(total) as s FROM ventas WHERE date(fecha) = date('now')`,`SELECT SUM(monto) as s FROM egresos WHERE date(fecha) = date('now')`,`SELECT SUM(stock_actual) as s FROM inventario`,`SELECT COUNT(*) as c FROM inventario WHERE stock_actual <= 1`,`SELECT * FROM ventas ORDER BY fecha DESC LIMIT 8`,`SELECT date(fecha) as d, SUM(total) as m FROM ventas WHERE date(fecha) >= date('now','-7 days') GROUP BY d`,`SELECT COUNT(*) as c FROM equipos`,`SELECT productos, COUNT(*) as qty FROM ventas GROUP BY productos ORDER BY qty DESC LIMIT 5`,`SELECT id, nombre, stock_actual, stock_minimo FROM inventario WHERE stock_actual <= 1 LIMIT 5`,`SELECT id_orden, cliente, equipo, estado FROM servicio_tecnico ORDER BY id_orden DESC LIMIT 5`,`SELECT COUNT(*) as c FROM creditos WHERE estado != 'Pagado' AND estado != 'Cancelado'`,`SELECT COUNT(*) as c FROM reventas`]),t=[],n=[];for(let r=6;r>=0;r--){let i=new Date;i.setDate(i.getDate()-r);let a=i.toISOString().slice(0,10);t.push(i.toLocaleDateString(`es-CO`,{weekday:`short`,day:`numeric`}));let o=(e[7]||[]).find(e=>e.d===a);n.push(o?o.m:0)}return{ingresosHoy:e[2]?.[0]?.s||0,egresosHoy:e[3]?.[0]?.s||0,utilidad:(e[2]?.[0]?.s||0)-(e[3]?.[0]?.s||0),totalProductos:e[0]?.[0]?.c||0,totalClientes:e[1]?.[0]?.c||0,totalStock:e[4]?.[0]?.s||0,stockCritico:e[5]?.[0]?.c||0,totalEquipos:e[8]?.[0]?.c||0,ventasRecientes:e[6]||[],topProductos:(e[9]||[]).map(e=>({nombre:e.productos,cantidad:e.qty})),productosBajoStock:(e[10]||[]).map(e=>({...e,stockActual:e.stock_actual})),tecRecientes:e[11]||[],creditosActivos:e[12]?.[0]?.c||0,totalReventas:e[13]?.[0]?.c||0,labels7d:t,ventas7d:n}},Fe=async()=>((await m(`SELECT * FROM egresos ORDER BY fecha DESC`))[0]||[]).map(e=>({...e,id:e.id_gasto})),Ie=e=>m({sql:`INSERT INTO egresos VALUES (?,?,?,?,?,?,?)`,args:h([`EGR-${Date.now()}`,new Date().toISOString(),e.categoria,e.concepto,e.responsable,e.monto,``])}),Le=async()=>((await m(`SELECT * FROM nominas ORDER BY fecha DESC`))[0]||[]).map(e=>({...e,id:e.id_nomina})),Re=e=>m({sql:`INSERT INTO nominas VALUES (?,?,?,?,?,?,?,?,?,?)`,args:h([`NOM-${Date.now()}`,e.fecha||new Date().toISOString(),e.empleado,e.periodo,e.salario_base,e.deducciones,e.bonificaciones,e.total_pagar,e.estado||`Pendiente`,e.notas||``])}),ze=e=>m({sql:`DELETE FROM nominas WHERE id_nomina = ?`,args:[{type:`text`,value:e}]}),Be=async()=>(await m(`SELECT * FROM tareas ORDER BY date(fecha_vencimiento) ASC`))[0]||[],Ve=e=>m({sql:`INSERT INTO tareas VALUES (?,?,?,?,?,?,?,?,?)`,args:h([`T-${Date.now()}`,e.tarea,e.fecha_inicio,e.fecha_vencimiento,e.prioridad,e.estado||`Pendiente`,e.responsable,e.notas||``,e.color||`#4f46e5`])}),He=(e,t)=>m({sql:`UPDATE tareas SET estado = ? WHERE id = ?`,args:[{type:`text`,value:t},{type:`text`,value:e}]}),Ue=e=>m({sql:`DELETE FROM tareas WHERE id = ?`,args:[{type:`text`,value:e}]});function g(e,t=`success`){let n={success:`bg-green-600`,error:`bg-error`,info:`bg-tertiary`,warning:`bg-amber-500`},r={success:`check_circle`,error:`error`,info:`info`,warning:`warning`},i=document.createElement(`div`);i.className=`fixed bottom-4 right-4 z-[9999] toast-animate`,i.innerHTML=`
    <div class="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl ${n[t]||n.success} min-w-[280px] max-w-sm">
      <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">${r[t]||r.success}</span>
      <span class="flex-1 text-sm font-semibold leading-tight">${e}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="opacity-60 hover:opacity-100 transition-opacity ml-2">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  `,document.body.appendChild(i),setTimeout(()=>i.remove(),4500)}var We=`modulepreload`,Ge=function(e){return`/adminpro/`+e},Ke={},qe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=Ge(t,n),t in Ke)return;Ke[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:We,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},Je=!1,_=null,Ye=`environment`,v=!1,y=null,Xe=null,b=null,Ze=null,x,Qe,$e,S,C,et,tt,nt,w,rt,T;async function it(){if(typeof BarcodeDetector<`u`)try{let e=await BarcodeDetector.getSupportedFormats(),t=[`qr_code`,`code_128`,`code_39`,`ean_13`,`ean_8`,`upc_a`,`upc_e`,`pdf417`].filter(t=>e.includes(t));b=new BarcodeDetector({formats:t.length?t:[`qr_code`,`code_128`,`ean_13`]}),Ze=`native`,console.log(`[Scanner] Motor: BarcodeDetector nativo`);return}catch{}let{readBarcodesFromImageData:e}=await qe(async()=>{let{readBarcodesFromImageData:e}=await import(`./reader-C_2V0ICK.js`);return{readBarcodesFromImageData:e}},[]);b=e,Ze=`zxing-wasm`,console.log(`[Scanner] Motor: zxing-wasm (C++ WASM)`)}async function at(e){if(e!==`environment`)return null;try{(await navigator.mediaDevices.getUserMedia({video:!0})).getTracks().forEach(e=>e.stop());let e=(await navigator.mediaDevices.enumerateDevices()).filter(e=>e.kind===`videoinput`),t=e.filter(e=>/back|rear|environment|posterior|trasera/i.test(e.label)),n=t.length?t:e,r=n.filter(e=>!/ultra|wide|macro|depth|tof|ir\b/i.test(e.label)),i=r.length?r:n,a=i[0]?.deviceId,o=-1;for(let e of i)try{let t=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:e.deviceId},width:{ideal:1920}}}),n=t.getVideoTracks()[0],r=n.getSettings(),i=n.getCapabilities?.()??{},s=0,c=(r.width??0)*(r.height??0);c>=1280*720&&(s+=10),c>=1920*1080&&(s+=5),c>=3840*2160&&(s-=5),i.focusMode?.includes?.(`continuous`)&&(s+=20);let l=i.focusDistance?.min??999;l<.1&&(s+=15),l<.3&&(s+=8);let u=i.zoom?.min??1;u>1.5&&(s-=20),console.log(`[Scanner] ${e.label} → score:${s} px:${Math.round(c/1e3)}K focus:${l} zoom:${u}`),t.getTracks().forEach(e=>e.stop()),s>o&&(o=s,a=e.deviceId)}catch{}return console.log(`[Scanner] Elegida: ${a} (score: ${o})`),a}catch{return null}}function ot(){try{let e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),n=e.createGain();t.connect(n),n.connect(e.destination),t.type=`sine`,t.frequency.setValueAtTime(800,e.currentTime),n.gain.setValueAtTime(.5,e.currentTime),n.gain.exponentialRampToValueAtTime(1e-5,e.currentTime+.15),t.start(e.currentTime),t.stop(e.currentTime+.15)}catch{}}function st(){let e=document.getElementById(`scanner-modal`);if(e){if(document.getElementById(`scanner-video`))return;e.remove()}document.body.insertAdjacentHTML(`beforeend`,`
    <div id="scanner-modal" class="hidden fixed inset-0 z-[60] items-center justify-center p-4">
      <div id="scanner-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10 flex flex-col max-h-[95vh]">
        
        <div class="flex items-center justify-between px-5 py-4 border-b border-surface-variant flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]" style="font-variation-settings:'FILL' 1">qr_code_scanner</span>
            <h3 id="scanner-title" class="font-bold text-on-surface text-sm">Escanear Código</h3>
          </div>
          <button id="scanner-close" class="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div id="scanner-reader-container" class="bg-black relative touch-none flex-1 min-h-[300px] overflow-hidden flex items-center justify-center">
          <video id="scanner-video" class="absolute inset-0 w-full h-full object-cover" playsinline muted autoplay></video>
          
          <div class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pointer-events-none">
            <div id="scanner-guide-box" class="border-2 border-white/60 relative flex-shrink-0 transition-none" style="width: 250px; height: 150px; box-shadow: 0 0 0 4000px rgba(0,0,0,0.65);">
              <div data-dir="tl" class="resize-handle absolute -top-1.5 -left-1.5 w-8 h-8 border-t-4 border-l-4 border-white pointer-events-auto cursor-nwse-resize"></div>
              <div data-dir="tr" class="resize-handle absolute -top-1.5 -right-1.5 w-8 h-8 border-t-4 border-r-4 border-white pointer-events-auto cursor-nesw-resize"></div>
              <div data-dir="bl" class="resize-handle absolute -bottom-1.5 -left-1.5 w-8 h-8 border-b-4 border-l-4 border-white pointer-events-auto cursor-nesw-resize"></div>
              <div data-dir="br" class="resize-handle absolute -bottom-1.5 -right-1.5 w-8 h-8 border-b-4 border-r-4 border-white pointer-events-auto cursor-nwse-resize"></div>
            </div>
          </div>

          <div class="absolute bottom-4 right-4 flex gap-2 z-20 pointer-events-auto">
            <button id="scanner-torch-btn" class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform" title="Linterna">
              <span class="material-symbols-outlined text-[20px]">flashlight_on</span>
            </button>
            <button id="scanner-switch-btn" class="w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform" title="Cambiar cámara">
              <span class="material-symbols-outlined text-[20px]">cameraswitch</span>
            </button>
          </div>
        </div>

        <div id="scanner-status" class="px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low flex-shrink-0">
          Iniciando cámara...
        </div>
        
        <div class="px-5 py-4 border-t border-surface-variant flex-shrink-0">
          <p class="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mb-2">O ingresa manualmente</p>
          <div class="flex gap-2">
            <input id="scanner-manual-input" type="text" placeholder="Escribe el código..." class="flex-1 bg-surface-container border border-surface-variant rounded-lg px-3 py-2.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            <button id="scanner-manual-btn" class="px-4 py-2.5 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">check</span> OK
            </button>
          </div>
        </div>
      </div>
    </div>`),x=document.getElementById(`scanner-modal`),Qe=document.getElementById(`scanner-backdrop`),$e=document.getElementById(`scanner-close`),document.getElementById(`scanner-reader-container`),S=document.getElementById(`scanner-video`),C=document.getElementById(`scanner-status`),et=document.getElementById(`scanner-title`),tt=document.getElementById(`scanner-manual-input`),nt=document.getElementById(`scanner-manual-btn`),w=document.getElementById(`scanner-torch-btn`),rt=document.getElementById(`scanner-switch-btn`),T=document.getElementById(`scanner-guide-box`),$e.addEventListener(`click`,_t),Qe.addEventListener(`click`,_t),nt.addEventListener(`click`,lt),tt.addEventListener(`keydown`,e=>{e.key===`Enter`&&lt()}),w.addEventListener(`click`,ut),rt.addEventListener(`click`,dt),ct()}function ct(){let e=document.querySelectorAll(`.resize-handle`),t=null,n,r,i,a;e.forEach(e=>{e.addEventListener(`touchstart`,o=>{t=e,n=o.touches[0].clientX,r=o.touches[0].clientY,i=T.offsetWidth,a=T.offsetHeight,o.preventDefault()},{passive:!1}),e.addEventListener(`mousedown`,o=>{t=e,n=o.clientX,r=o.clientY,i=T.offsetWidth,a=T.offsetHeight,o.preventDefault()})});let o=(e,o,s)=>{if(!t)return;let c=e-n,l=o-r,u=i,d=a,f=t.dataset.dir;f===`br`?(u=i+c*2,d=a+l*2):f===`bl`?(u=i-c*2,d=a+l*2):f===`tr`?(u=i+c*2,d=a-l*2):f===`tl`&&(u=i-c*2,d=a-l*2),u=Math.max(40,Math.min(u,window.innerWidth-30)),d=Math.max(40,Math.min(d,400)),T.style.width=u+`px`,T.style.height=d+`px`,s&&s.preventDefault()};document.addEventListener(`touchmove`,e=>{t&&o(e.touches[0].clientX,e.touches[0].clientY,e)},{passive:!1}),document.addEventListener(`mousemove`,e=>{t&&o(e.clientX,e.clientY,e)});let s=()=>{t&&=null};document.addEventListener(`touchend`,s),document.addEventListener(`mouseup`,s)}function lt(){let e=tt.value.trim();e&&(_&&_(e),_t())}async function ut(){if(!y)return;let e=y.getVideoTracks()[0];if(e){v=!v;try{await e.applyConstraints({advanced:[{torch:v}]}),w.innerHTML=`<span class="material-symbols-outlined text-[20px]">${v?`flashlight_off`:`flashlight_on`}</span>`,v?w.classList.replace(`bg-black/50`,`bg-primary`):w.classList.replace(`bg-primary`,`bg-black/50`)}catch(e){console.error(`Torch not supported`,e),v=!1}}}async function dt(){Je&&(Ye=Ye===`environment`?`user`:`environment`,C.textContent=`Cambiando cámara...`,ft(),v=!1,w.innerHTML=`<span class="material-symbols-outlined text-[20px]">flashlight_on</span>`,w.classList.remove(`bg-primary`),w.classList.add(`bg-black/50`),await pt())}function ft(){y&&=(y.getTracks().forEach(e=>e.stop()),null),S&&(S.srcObject=null),Xe&&=(cancelAnimationFrame(Xe),null)}async function pt(){try{let e={video:{facingMode:Ye}},t=await at(Ye);t&&(e.video={deviceId:{exact:t}}),y=await navigator.mediaDevices.getUserMedia(e),S.srcObject=y;let n=y.getVideoTracks()[0];if(n?.applyConstraints){try{await n.applyConstraints({advanced:[{focusMode:`continuous`}]})}catch{}try{await n.applyConstraints({zoom:1})}catch{}}await new Promise(e=>{S.onloadedmetadata=()=>{S.play(),e()}}),Je=!0,C.textContent=`📷 Apunta al código de barras o QR...`,C.className=`px-5 py-3 text-center text-sm text-blue-800 bg-blue-50 font-medium`,mt()}catch(e){console.error(`Scanner error:`,e),C.textContent=`⚠️ No se pudo acceder a la cámara. Usa la entrada manual.`,C.className=`px-5 py-3 text-center text-sm text-amber-800 bg-amber-50`}}function mt(){Je&&(S.readyState>=2&&!S.paused?ht().then(e=>{e?(ot(),C.textContent=`✅ Detectado: ${e}`,C.className=`px-5 py-3 text-center text-sm text-green-800 bg-green-50 font-bold`,_&&_(e),setTimeout(()=>_t(),600)):Xe=requestAnimationFrame(mt)}).catch(e=>{Xe=requestAnimationFrame(mt)}):Xe=requestAnimationFrame(mt))}async function ht(){let e=S.getBoundingClientRect(),t=T.getBoundingClientRect();if(e.width===0||e.height===0)return null;let n=e.width/S.videoWidth,r=e.height/S.videoHeight,i=Math.max(n,r),a=S.videoWidth*i,o=S.videoHeight*i,s=(a-e.width)/2,c=(o-e.height)/2,l=(t.left-e.left+s)/i,u=(t.top-e.top+c)/i,d=t.width/i,f=t.height/i;if(d<=0||f<=0)return null;let p=document.createElement(`canvas`);p.width=d,p.height=f;let m=p.getContext(`2d`,{willReadFrequently:!0});if(m.drawImage(S,l,u,d,f,0,0,d,f),Ze===`native`&&b)try{let e=await b.detect(p);if(e.length>0)return e[0].rawValue}catch{}else if(Ze===`zxing-wasm`&&b)try{let e=m.getImageData(0,0,d,f),t=await b(e,{tryHarder:!0,formats:[`QRCode`,`Code128`,`Code39`,`EAN13`,`EAN8`,`UPCA`,`UPCE`,`PDF417`,`DataMatrix`],maxNumberOfSymbols:1});if(t.length>0)return t[0].text}catch{}return null}async function gt({title:e=`Escanear Código`,onScan:t}={}){await it(),st(),_=t,Ye=`environment`,v=!1,Je=!1,et.textContent=e,tt.value=``,C.textContent=`Iniciando cámara...`,C.className=`px-5 py-3 text-center text-sm text-on-surface-variant bg-surface-container-low`,w&&(w.innerHTML=`<span class="material-symbols-outlined text-[20px]">flashlight_on</span>`,w.classList.remove(`bg-primary`),w.classList.add(`bg-black/50`)),T&&(T.style.width=`280px`,T.style.height=`120px`),x.classList.remove(`hidden`),x.classList.add(`flex`),await pt()}async function _t(){Je=!1,ft(),x&&(x.classList.add(`hidden`),x.classList.remove(`flex`)),_=null}var E=[],D=[],O=null,vt=`grid`;function yt(e,t){let n=Number(e),r=Number(t);return n===0?{label:`Sin Stock`,cls:`bg-red-100 text-red-800 border-red-200`,icon:`block`}:n<=r?{label:`Bajo: ${n}`,cls:`bg-amber-100 text-amber-800 border-amber-200`,icon:`warning`}:{label:`OK: ${n}`,cls:`bg-emerald-100 text-emerald-800 border-emerald-200`,icon:`check_circle`}}function bt(){let e=document.getElementById(`inv-grid`),t=document.getElementById(`inv-table-wrapper`),n=document.getElementById(`inv-table-body`);if(!e)return;let r=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`),i=r.rol===`Administrador`,a=r.rol===`Técnico de reparación`;vt===`grid`?(t.classList.add(`hidden`),e.classList.remove(`hidden`),e.innerHTML=D.length?D.map(e=>{let t=yt(e.stockActual,e.stockMinimo),n=Number(e.stockActual)===0,r=Number(String(e.precioVenta).replace(/\D/g,``)).toLocaleString(`es-CO`);return`
            <div onclick="inventoryView.openDetail('${e.id}')" class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer ${n?`opacity-70 grayscale-[0.5]`:``}">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0">
                  ${e.imagen?`<img src="${e.imagen}" class="w-full h-full object-cover">`:`<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">image</span>`}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="font-bold text-on-surface text-sm truncate" title="${e.nombre}">${e.nombre}</h3>
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border whitespace-nowrap ${t.cls}">${t.label}</span>
                  </div>
                  <p class="text-[10px] uppercase font-bold text-on-surface-variant mb-1">${e.marca||`-`}</p>
                  <p class="font-mono text-xs font-bold text-on-surface-variant/70 mb-2 truncate" title="${e.sku||e.id}">${e.sku||e.id}</p>
                </div>
              </div>
              <div class="flex items-end justify-between mt-auto pt-3 border-t border-surface-variant/50">
                ${a?`<div></div>`:`<div>
                  <p class="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-0.5">Precio Venta</p>
                  <p class="font-black text-primary text-lg leading-none">$${r}</p>
                </div>`}
                <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${i?`<button onclick="event.stopPropagation(); inventoryView.openEdit('${e.id}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-primary hover:bg-primary/10 transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                  </button>`:``}
                  ${i?`<button onclick="event.stopPropagation(); inventoryView.deleteProduct('${e.id}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-error hover:bg-error/10 transition-colors" title="Eliminar">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>`:``}
                </div>
              </div>
            </div>
          `}).join(``):`<div class="col-span-full text-center py-20 text-on-surface-variant">
           <span class="material-symbols-outlined text-5xl">search_off</span>
           <p class="mt-2 font-semibold">No hay productos que coincidan.</p>
         </div>`):(e.classList.add(`hidden`),t.classList.remove(`hidden`),n.innerHTML=D.length?D.map(e=>{let t=yt(e.stockActual,e.stockMinimo),n=Number(e.stockActual)===0,r=Number(String(e.precioVenta).replace(/\D/g,``)).toLocaleString(`es-CO`),o=Number(String(e.costo||0).replace(/\D/g,``)).toLocaleString(`es-CO`);return`
            <tr onclick="inventoryView.openDetail('${e.id}')" class="hover:bg-surface-container-low transition-colors cursor-pointer ${n?`opacity-70`:``}">
              <td class="px-4 py-3">
                ${e.imagen?`<img src="${e.imagen}" class="w-8 h-8 rounded object-cover">`:`<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center"><span class="material-symbols-outlined text-[16px] text-on-surface-variant/50">inventory_2</span></div>`}
              </td>
              <td class="px-4 py-3">
                <p class="font-bold text-sm text-on-surface">${e.nombre}</p>
                <p class="text-[10px] text-on-surface-variant">${e.marca||`-`}</p>
              </td>
              <td class="px-4 py-3 font-mono text-xs font-bold text-on-surface-variant">${e.sku||e.id}</td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">${e.categoria}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border ${t.cls}">${t.label}</span>
              </td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">${a?`N/A`:`$${o}`}</td>
              <td class="px-4 py-3 font-bold text-primary">${a?`N/A`:`$${r}`}</td>
              <td class="px-4 py-3 text-xs text-on-surface-variant">${e.ubicacion||`—`}</td>
              <td class="px-4 py-3 text-right">
                ${i?`<button onclick="event.stopPropagation(); inventoryView.openEdit('${e.id}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
                  <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>`:``}
                ${i?`<button onclick="event.stopPropagation(); inventoryView.deleteProduct('${e.id}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
                  <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>`:``}
              </td>
            </tr>
          `}).join(``):`<tr><td colspan="6" class="text-center py-10 text-on-surface-variant">No hay productos</td></tr>`);let o=document.getElementById(`inv-stat-total`),s=document.getElementById(`inv-stat-alert`);o&&(o.textContent=E.length.toLocaleString()),s&&(s.textContent=E.filter(e=>Number(e.stockActual)<=Number(e.stockMinimo)).length)}function xt(){let e=(document.getElementById(`inv-search`)?.value||``).toLowerCase(),t=document.getElementById(`inv-filter-cat`)?.value||``,n=document.getElementById(`inv-filter-tipo`)?.value||``;D=E.filter(r=>(!e||[r.nombre,r.marca,r.sku,r.id].some(t=>String(t).toLowerCase().includes(e)))&&(!t||r.categoria===t)&&(!n||(r.tipo||``)===n)),bt()}function St(e){document.getElementById(`inv-modal-title`).textContent=e,document.getElementById(`inv-modal`).classList.remove(`hidden`),document.getElementById(`inv-modal`).classList.add(`flex`)}function Ct(){document.getElementById(`inv-modal`).classList.add(`hidden`),document.getElementById(`inv-modal`).classList.remove(`flex`),O=null,window.__posReventaMode=!1,document.getElementById(`inv-form`).reset(),document.getElementById(`inv-img-preview`).innerHTML=`<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">add_photo_alternate</span>`}function wt(e){let t=e.target.files[0];if(!t)return;let n=new FileReader;n.onload=e=>{document.getElementById(`inv-img-preview`).innerHTML=`<img src="${e.target.result}" class="w-full h-full object-cover">`},n.readAsDataURL(t)}async function Tt(){let e=document.getElementById(`inv-save-btn`);e.disabled=!0,e.innerHTML=`<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Guardando...`;try{let t=document.getElementById(`inv-existing-img`).value,n=document.getElementById(`inv-img-file`);if(n.files[0]){let r=n.files[0];e.innerHTML=`<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Subiendo foto...`;let i=new FileReader;t=await new Promise((e,t)=>{i.onload=async n=>{try{let t=await te(n.target.result,r.name,r.type);e(t.url||t)}catch(e){t(e)}},i.readAsDataURL(r)})}let r=[document.getElementById(`inv-id`).value,document.getElementById(`inv-nombre`).value,document.getElementById(`inv-marca`).value,document.getElementById(`inv-categoria`).value,document.getElementById(`inv-tipo`).value,document.getElementById(`inv-costo`).value.replace(/\D/g,``),document.getElementById(`inv-venta`).value.replace(/\D/g,``),document.getElementById(`inv-stock-min`).value,document.getElementById(`inv-stock-act`).value,document.getElementById(`inv-ubicacion`).value,document.getElementById(`inv-sku`).value,t],i;if(i=O?await ge(O,r):await he(r),g(i.mensaje||`Guardado correctamente`,i.success?`success`:`error`),i.success){if(window.__posReventaMode&&!O){let e={id:r[0],nombre:r[1],marca:r[2],categoria:r[3],costo:r[5],precioVenta:r[6]};typeof window.__posAddReventaToCart==`function`&&window.__posAddReventaToCart(e),window.__posReventaMode=!1}Ct(),await Dt()}}catch(e){g(`Error: `+e.message,`error`)}finally{e.disabled=!1,e.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`}}var Et=null;window.inventoryView={openDetail(e){let t=E.find(t=>t.id===e);if(!t)return;Et=e;let n=e=>Number(String(e||0).replace(/\D/g,``)||0).toLocaleString(`es-CO`),r=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`),i=r.rol===`Técnico de reparación`;document.getElementById(`inv-d-nombre`).textContent=t.nombre||`—`,document.getElementById(`inv-d-marca`).textContent=t.marca||`—`,document.getElementById(`inv-d-cat`).textContent=t.categoria||`—`,document.getElementById(`inv-d-costo`).textContent=i?`N/A`:`$${n(t.costo)}`,document.getElementById(`inv-d-venta`).textContent=i?`N/A`:`$${n(t.precioVenta)}`,document.getElementById(`inv-d-stock`).textContent=t.stockActual??`—`,document.getElementById(`inv-d-stockmin`).textContent=t.stockMinimo??`—`,document.getElementById(`inv-d-tipo`).textContent=t.tipo||`—`,document.getElementById(`inv-d-ubicacion`).textContent=t.ubicacion||`—`,document.getElementById(`inv-d-sku`).textContent=t.sku||t.id||`—`;let a=document.getElementById(`inv-detail-img-wrap`),o=document.getElementById(`inv-detail-img`);t.imagen?(o.src=t.imagen,a.classList.remove(`hidden`)):a.classList.add(`hidden`);let s=r.rol===`Administrador`,c=document.getElementById(`inv-detail-edit-btn`);c&&(s?c.classList.remove(`hidden`):c.classList.add(`hidden`));let l=document.getElementById(`inv-detail-modal`);l.classList.remove(`hidden`),l.classList.add(`flex`)},openEdit(e){let t=E.find(t=>t.id===e);if(!t)return;O=e;let n=document.getElementById(`inv-detail-modal`);n.classList.add(`hidden`),n.classList.remove(`flex`),document.getElementById(`inv-id`).value=t.id,document.getElementById(`inv-nombre`).value=t.nombre,document.getElementById(`inv-marca`).value=t.marca,document.getElementById(`inv-categoria`).value=t.categoria,document.getElementById(`inv-tipo`).value=t.tipo||`Físico`,document.getElementById(`inv-costo`).value=t.costo?new Intl.NumberFormat(`es-CO`).format(t.costo):``,document.getElementById(`inv-venta`).value=t.precioVenta?new Intl.NumberFormat(`es-CO`).format(t.precioVenta):``,document.getElementById(`inv-stock-min`).value=t.stockMinimo,document.getElementById(`inv-stock-act`).value=t.stockActual,document.getElementById(`inv-ubicacion`).value=t.ubicacion,document.getElementById(`inv-sku`).value=t.sku,document.getElementById(`inv-existing-img`).value=t.imagen||``,t.imagen&&(document.getElementById(`inv-img-preview`).innerHTML=`<img src="${t.imagen}" class="w-full h-full object-cover">`),St(`Editar Producto`)},async deleteProduct(e){if(confirm(`¿Eliminar este producto?`))try{let t=await _e(e);g(t.mensaje||`Eliminado`,t.success?`success`:`error`),t.success&&await Dt()}catch(e){g(`Error: `+e.message,`error`)}},openNuevo(e=!1){O=null,document.getElementById(`inv-form`)?.reset(),document.getElementById(`inv-tipo`).value=e?`Reventa`:`Físico`,document.getElementById(`inv-existing-img`).value=``,document.getElementById(`inv-img-preview`).innerHTML=`<span class="material-symbols-outlined text-3xl text-on-surface-variant/40">add_photo_alternate</span>`,e&&(document.getElementById(`inv-id`).value=`REV-`+Date.now().toString().slice(-6)),St(e?`Nueva Reventa`:`Nuevo Producto`)}};async function Dt(){let e=document.getElementById(`inv-grid`);e&&(e.innerHTML=`<div class="col-span-full flex justify-center py-20">
    <span class="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span></div>`);try{let e=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).rol===`Técnico de reparación`,t=await me();E=e?t.filter(e=>e.categoria&&e.categoria.toLowerCase().includes(`repuesto`)):t,D=[...E],bt(),Ot()}catch(t){e&&(e.innerHTML=`<div class="col-span-full text-center py-20 text-error font-semibold">
      <span class="material-symbols-outlined text-4xl">wifi_off</span>
      <p class="mt-2">Error al cargar: ${t.message}</p></div>`)}}function Ot(){let e=document.getElementById(`inv-filter-cat`),t=[...new Set(E.map(e=>e.categoria).filter(Boolean))];e&&(e.innerHTML=`<option value="">Todas las categorías</option>`+t.map(e=>`<option value="${e}">${e}</option>`).join(``));let n=document.getElementById(`datalist-categorias`);n&&(n.innerHTML=t.map(e=>`<option value="${e}">`).join(``));let r=document.getElementById(`datalist-marcas`);r&&(r.innerHTML=[...new Set(E.map(e=>e.marca).filter(Boolean))].map(e=>`<option value="${e}">`).join(``))}function kt(e){let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))}function At(){document.addEventListener(`barcodeScanned`,e=>{let t=document.querySelector(`[data-view="inventory"]`);if(!t||t.classList.contains(`hidden`))return;let n=e.detail,r=document.getElementById(`inv-modal`);if(r&&!r.classList.contains(`hidden`)){let e=document.getElementById(`inv-sku`);e&&(e.value=n,g(`SKU ingresado: ${n}`,`success`));return}let i=document.getElementById(`inv-search`);i&&(i.value=n,xt(),D.length===1?(inventoryView.openDetail(D[0].id),g(`Producto encontrado`,`success`)):D.length===0&&g(`No se encontró el producto`,`warning`))}),document.getElementById(`inv-search`)?.addEventListener(`input`,xt),document.getElementById(`inv-filter-cat`)?.addEventListener(`change`,xt),document.getElementById(`inv-filter-tipo`)?.addEventListener(`change`,xt),document.getElementById(`inv-view-toggle`)?.addEventListener(`click`,()=>{vt=vt===`grid`?`table`:`grid`;let e=document.getElementById(`inv-view-toggle`).querySelector(`span`);e.textContent=vt===`grid`?`view_list`:`grid_view`,bt()}),document.getElementById(`inv-auto-id-btn`)?.addEventListener(`click`,()=>{document.getElementById(`inv-id`).value=`PROD-`+Date.now().toString().slice(-6)}),document.getElementById(`inv-new-btn`)?.addEventListener(`click`,()=>{window.inventoryView&&window.inventoryView.openNuevo&&window.inventoryView.openNuevo(!1)}),document.getElementById(`inv-costo`)?.addEventListener(`input`,kt),document.getElementById(`inv-venta`)?.addEventListener(`input`,kt),document.getElementById(`inv-modal-close`)?.addEventListener(`click`,Ct),document.getElementById(`inv-modal-backdrop`)?.addEventListener(`click`,Ct),document.getElementById(`inv-img-file`)?.addEventListener(`change`,wt),document.getElementById(`inv-save-btn`)?.addEventListener(`click`,Tt),document.getElementById(`inv-scan-sku`)?.addEventListener(`click`,()=>{gt({title:`Escanear SKU / Barcode`,onScan:e=>{document.getElementById(`inv-sku`).value=e,g(`SKU Detectado: ${e}`,`success`)}})});let e=null,t=document.getElementById(`inv-quick-input-modal`),n=document.getElementById(`inv-qi-title`),r=document.getElementById(`inv-qi-input`),i=document.getElementById(`inv-qi-save`),a=document.getElementById(`inv-qi-cancel`),o=document.getElementById(`inv-qi-backdrop`);function s(i){e=i,n.textContent=i===`marca`?`Nueva Marca`:`Nueva Categoría`,r.value=``,t.classList.remove(`hidden`),t.classList.add(`flex`),setTimeout(()=>r.focus(),50)}function c(){t.classList.add(`hidden`),t.classList.remove(`flex`)}a.addEventListener(`click`,c),o.addEventListener(`click`,c),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&i.click()}),i.addEventListener(`click`,()=>{let t=r.value.trim();if(t){if(e===`marca`){let e=document.getElementById(`datalist-marcas`);if(![...e.options].some(e=>e.value.toLowerCase()===t.toLowerCase())){let n=document.createElement(`option`);n.value=t,e.appendChild(n)}document.getElementById(`inv-marca`).value=t,g(`Marca "${t}" agregada`,`success`)}else{let e=document.getElementById(`datalist-categorias`),n=document.getElementById(`inv-filter-cat`);if(![...e.options].some(e=>e.value.toLowerCase()===t.toLowerCase())){let r=document.createElement(`option`);if(r.value=t,e.appendChild(r),n){let e=document.createElement(`option`);e.value=t,e.textContent=t,n.appendChild(e)}}document.getElementById(`inv-categoria`).value=t,g(`Categoría "${t}" agregada`,`success`)}c()}}),document.getElementById(`inv-add-marca-btn`)?.addEventListener(`click`,()=>s(`marca`)),document.getElementById(`inv-add-cat-btn`)?.addEventListener(`click`,()=>s(`cat`));let l=()=>{let e=document.getElementById(`inv-detail-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)};return document.getElementById(`inv-detail-close`)?.addEventListener(`click`,l),document.getElementById(`inv-detail-close2`)?.addEventListener(`click`,l),document.getElementById(`inv-detail-backdrop`)?.addEventListener(`click`,l),document.getElementById(`inv-detail-edit-btn`)?.addEventListener(`click`,()=>{Et&&inventoryView.openEdit(Et)}),Dt}var jt=!1;function Mt(){return async()=>{Nt(),jt||=(document.getElementById(`dash-refresh-btn`)?.addEventListener(`click`,Pt),document.querySelectorAll(`[data-goto]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.goto;t&&o(t)})}),!0),await Pt()}}function Nt(){let e=new Date().getHours(),t=e<12?`¡Buenos días! 👋`:e<18?`¡Buenas tardes! ☕`:`¡Buenas noches! 🌙`,n=document.getElementById(`dash-greeting`);n&&(n.textContent=t)}async function Pt(){try{let[e,t]=await Promise.all([Pe(),Be()]);Ft(`dash-ventas-hoy`,e.ingresosHoy,!0),Ft(`dash-egresos-hoy`,e.egresosHoy,!0),Ft(`dash-utilidad`,e.utilidad,!0),Ft(`dash-stock-critico`,e.stockCritico),It(e.ventasRecientes),Lt(e.topProductos),Rt(e.productosBajoStock),zt(e.tecRecientes),Vt(e.labels7d,e.ventas7d),Bt(t)}catch(e){console.error(`Dashboard error:`,e)}}function Ft(e,t,n=!1){let r=document.getElementById(e);r&&(r.textContent=n?`$`+new Intl.NumberFormat(`es-CO`).format(t||0):(t||0).toLocaleString())}function It(e){let t=document.getElementById(`dash-ventas-list`);if(t){if(!e||e.length===0){t.innerHTML=`<p class="p-5 text-sm text-on-surface-variant text-center">No hay ventas hoy</p>`;return}t.innerHTML=e.map(e=>`
    <div class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors">
      <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        <span class="material-symbols-outlined text-[18px]">receipt</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-on-surface truncate">${e.cliente||`Consumidor Final`}</p>
        <p class="text-[11px] text-on-surface-variant">${e.id_factura} · ${new Date(e.fecha).toLocaleDateString()}</p>
      </div>
      <div class="text-right font-bold text-on-surface text-sm">$${new Intl.NumberFormat(`es-CO`).format(e.total)}</div>
    </div>
  `).join(``)}}function Lt(e){let t=document.getElementById(`dash-top-productos`);if(t){if(!e||e.length===0){t.innerHTML=`<p class="p-4 text-center text-xs text-on-surface-variant italic">Sin ventas aún</p>`;return}t.innerHTML=e.map((e,t)=>`
    <div class="flex items-center gap-3">
      <span class="text-lg font-black text-outline-variant/20 w-5">0${t+1}</span>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold text-on-surface truncate">${e.nombre}</p>
        <div class="flex items-center gap-2 mt-0.5">
          <div class="flex-1 h-1 bg-surface-container rounded-full overflow-hidden">
            <div class="h-full bg-primary" style="width: ${Math.min(e.cantidad*10,100)}%"></div>
          </div>
          <span class="text-[10px] font-black text-primary">${e.cantidad}</span>
        </div>
      </div>
    </div>
  `).join(``)}}function Rt(e){let t=document.getElementById(`dash-stock-alertas`);if(t){if(!e||e.length===0){t.innerHTML=`<p class="p-4 text-center text-xs text-on-surface-variant italic">Stock ok</p>`;return}t.innerHTML=e.map(e=>`
    <div class="flex items-center justify-between p-2.5 bg-error/5 border border-error/10 rounded-lg">
      <div class="min-w-0">
        <p class="text-xs font-bold text-on-surface truncate">${e.nombre}</p>
        <p class="text-[10px] text-error">Quedan: ${e.stock_actual}</p>
      </div>
      <span class="material-symbols-outlined text-error text-[18px] ${Number(e.stock_actual)===0?`animate-bounce`:`animate-pulse`}">warning</span>
    </div>
  `).join(``)}}function zt(e){let t=document.getElementById(`dash-tec-list`);if(t){if(!e||e.length===0){t.innerHTML=`<p class="p-5 text-sm text-on-surface-variant text-center">Sin servicios</p>`;return}t.innerHTML=e.map(e=>`
    <li class="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors">
      <div class="min-w-0">
        <p class="text-xs font-bold text-on-surface truncate">${e.equipo}</p>
        <p class="text-[10px] text-on-surface-variant">${e.cliente}</p>
      </div>
      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">${e.estado}</span>
    </li>
  `).join(``)}}function Bt(e){let t=document.getElementById(`dash-tasks-list`);if(!t)return;let n=(e||[]).filter(e=>e.estado!==`Completada`).slice(0,5);if(n.length===0){t.innerHTML=`<p class="p-8 text-center text-xs text-on-surface-variant italic">No hay pendientes</p>`;return}t.innerHTML=n.map(e=>`
    <li class="flex items-center gap-3 px-5 py-3 hover:bg-surface-container-low transition-colors">
      <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${e.color||`#4f46e5`}"></span>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-bold text-on-surface truncate">${e.tarea}</p>
        <p class="text-[9px] text-on-surface-variant uppercase tracking-tight">${new Date(e.fecha_vencimiento).toLocaleDateString(`es-CO`,{day:`numeric`,month:`short`})}</p>
      </div>
    </li>
  `).join(``)}function Vt(e,t){let n=document.getElementById(`dash-chart`);if(!n)return;if(!t||t.length===0||t.every(e=>e===0)){n.innerHTML=`<div class="flex-1 flex items-center justify-center text-on-surface-variant text-xs italic opacity-50">Sin ventas</div>`;return}let r=Math.max(...t,1);n.innerHTML=t.map((t,n)=>{let i=Math.max(t/r*100,5);return`
      <div class="flex-1 flex flex-col items-center group h-full">
        <div class="flex-1 w-full flex items-end justify-center">
          <div class="w-full max-w-[28px] rounded-t-md transition-all duration-500 relative ${t===0?`bg-surface-container/30`:`bg-primary`}"
               style="height: ${i}%;"></div>
        </div>
        <span class="text-[9px] text-on-surface-variant font-bold mt-2 uppercase tracking-tighter">${e[n]||``}</span>
      </div>
    `}).join(``)}var k=[],Ht=!1,Ut=null,Wt,Gt,Kt,qt,Jt,Yt,Xt;async function Zt(){if(Qt(),!Ht)try{k=await ue(),Ht=!0}catch(e){console.error(`Error loading clients for selector`,e)}}function Qt(){document.getElementById(`customer-selector-modal`)||(document.body.insertAdjacentHTML(`beforeend`,`
    <div id="customer-selector-modal" class="hidden fixed inset-0 z-[70] items-center justify-center p-4">
      <div id="cs-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden z-10">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-surface-container-lowest border-b border-surface-variant shrink-0">
          <h3 class="font-bold text-lg text-on-surface">Seleccionar Cliente</h3>
          <button id="cs-close" class="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <!-- Search Area -->
        <div id="cs-search-area" class="p-4 border-b border-surface-variant shrink-0">
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input id="cs-search" type="text" placeholder="Buscar documento, nombre..." autocomplete="off"
                class="w-full bg-surface-container-low border border-surface-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" />
            </div>
            <button id="cs-new-btn" title="Nuevo Cliente" class="px-3 bg-primary text-on-primary rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">person_add</span>
            </button>
          </div>
        </div>

        <!-- New Client Form (Hidden by default) -->
        <div id="cs-new-form-area" class="hidden p-4 border-b border-surface-variant bg-surface-container-lowest shrink-0">
          <p class="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Crear Cliente Rápido</p>
          <div class="space-y-3">
             <div>
                <input id="cs-new-doc" type="text" placeholder="Documento *" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div>
                <input id="cs-new-nom" type="text" placeholder="Nombre completo *" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div class="grid grid-cols-2 gap-2">
                <input id="cs-new-tel" type="text" placeholder="Teléfono" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
                <input id="cs-new-email" type="email" placeholder="Email" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div>
                <input id="cs-new-dir" type="text" placeholder="Dirección" class="w-full bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" />
             </div>
             <div class="flex gap-2">
                <select id="cs-new-tipo" class="flex-1 bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="Empresa">Empresa</option>
                  <option value="Mayorista">Mayorista</option>
                </select>
                <button id="cs-save-new" class="px-4 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container whitespace-nowrap">Guardar</button>
                <button id="cs-cancel-new" class="px-3 bg-surface-variant text-on-surface text-sm rounded-lg hover:bg-surface-container-high">x</button>
             </div>
          </div>
        </div>

        <!-- Results List -->
        <div class="flex-1 overflow-y-auto p-2 bg-surface-container-lowest">
          <ul id="cs-results" class="divide-y divide-surface-variant">
            <li class="p-4 text-center text-sm text-on-surface-variant">Escribe para buscar o crea uno nuevo</li>
          </ul>
        </div>
      </div>
    </div>
  `),Wt=document.getElementById(`customer-selector-modal`),Gt=document.getElementById(`cs-backdrop`),Kt=document.getElementById(`cs-close`),qt=document.getElementById(`cs-search`),Jt=document.getElementById(`cs-new-btn`),Yt=document.getElementById(`cs-results`),Xt=document.getElementById(`cs-new-form-area`),Kt.addEventListener(`click`,rn),Gt.addEventListener(`click`,rn),qt.addEventListener(`input`,$t),Jt.addEventListener(`click`,()=>{Xt.classList.toggle(`hidden`),document.getElementById(`cs-new-doc`).focus()}),document.getElementById(`cs-cancel-new`).addEventListener(`click`,()=>{Xt.classList.add(`hidden`)}),document.getElementById(`cs-save-new`).addEventListener(`click`,async()=>{let e=document.getElementById(`cs-new-doc`).value.trim(),t=document.getElementById(`cs-new-nom`).value.trim(),n=document.getElementById(`cs-new-tel`).value.trim(),r=document.getElementById(`cs-new-email`).value.trim(),i=document.getElementById(`cs-new-dir`).value.trim(),a=document.getElementById(`cs-new-tipo`).value;if(!e||!t){g(`Documento y Nombre son obligatorios`,`warning`);return}let o=document.getElementById(`cs-save-new`);o.disabled=!0,o.textContent=`...`;try{let o=await de({documento:e,cedula:e,nombre:t,telefono:n,direccion:i,email:r,tipo:a});if(o&&o.success){g(`Cliente creado`,`success`);let o={cedula:e,documento:e,nombre:t,telefono:n,direccion:i,email:r,tipo:a,id:e};k.push(o),Xt.classList.add(`hidden`),document.getElementById(`cs-new-doc`).value=``,document.getElementById(`cs-new-nom`).value=``,document.getElementById(`cs-new-tel`).value=``,document.getElementById(`cs-new-email`).value=``,document.getElementById(`cs-new-dir`).value=``,document.getElementById(`cs-new-tipo`).value=`General`,tn(o)}else g(o.mensaje||`Error al crear`,`error`)}catch{g(`Error de conexión`,`error`)}finally{o.disabled=!1,o.textContent=`Guardar`}}))}function $t(){let e=qt.value.toLowerCase().trim();if(!e){Yt.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">Escribe para buscar...</li>`;return}en(k.filter(t=>(t.cedula||t.documento||``).toLowerCase().includes(e)||t.nombre&&t.nombre.toLowerCase().includes(e)||t.telefono&&t.telefono.toLowerCase().includes(e)).slice(0,20))}function en(e){if(e.length===0){Yt.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">No se encontraron clientes.</li>`;return}Yt.innerHTML=e.map(e=>{let t=e.cedula||e.documento||``;return`
    <li>
      <button type="button" class="cs-item-btn w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex flex-col focus:bg-surface-container-low outline-none" data-doc="${t}">
        <span class="font-bold text-sm text-on-surface">${e.nombre}</span>
        <span class="text-[11px] text-on-surface-variant mt-0.5">C.C: ${t} ${e.telefono?`• Tel: `+e.telefono:``}</span>
      </button>
    </li>
  `}).join(``),document.querySelectorAll(`.cs-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.doc,n=k.find(e=>(e.cedula||e.documento||``)===t);n&&(n.documento=t,tn(n))})})}function tn(e){Ut&&Ut(e),rn()}async function nn(e){await Zt(),Ut=e,qt.value=``,k.length>0?en([...k].reverse().slice(0,20)):Yt.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">No hay clientes. Crea uno nuevo.</li>`,Xt.classList.add(`hidden`),Wt.classList.remove(`hidden`),Wt.classList.add(`flex`),setTimeout(()=>qt.focus(),100)}function rn(){Wt.classList.add(`hidden`),Wt.classList.remove(`flex`),Ut=null}var A=[],j=[],an=!1,on=!1,sn=null,M,cn,ln,un,dn,fn,pn,mn,hn,gn,_n,N,vn,P,F;function yn(){return async()=>{bn(),an||=(await xn(),Cn(),En(),!0),Sn(A),I()}}function bn(){M=document.getElementById(`pos-search`),cn=document.getElementById(`pos-products-grid`),ln=document.getElementById(`pos-cart-items`),un=document.getElementById(`pos-subtotal`),dn=document.getElementById(`pos-descuento`),fn=document.getElementById(`pos-total`),document.getElementById(`pos-pay-btn`),pn=document.getElementById(`pos-cliente-doc`),mn=document.getElementById(`pos-cliente-nombre`),hn=document.getElementById(`pos-checkout-modal`),gn=document.getElementById(`pos-checkout-close`),_n=document.getElementById(`pos-checkout-cancel`),N=document.getElementById(`pos-checkout-confirm`),vn=document.getElementById(`pos-evidencia-file`),P=document.getElementById(`pos-canvas-cliente`)}async function xn(){try{A=(await me()).filter(e=>e.stockActual>0)}catch{A=[]}}function Sn(e){if(e.length===0){cn.innerHTML=`<p class="p-4 col-span-full text-center opacity-50 italic text-sm">Sin stock disponible</p>`;return}cn.innerHTML=e.map(e=>`
    <div onclick="window.posAddToCart('${e.id}')" 
      class="bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:border-primary hover:shadow-xl transition-all active:scale-95 shadow-sm group h-[240px]">
      <div class="h-36 w-full bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden border-b border-slate-100">
        ${e.imagen?`<img src="${e.imagen}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />`:`<span class="material-symbols-outlined text-slate-300 text-[40px]">image</span>`}
      </div>
      <div class="p-4 flex flex-col justify-between flex-1 min-w-0 bg-white">
        <h3 class="text-xs font-black text-slate-800 leading-tight line-clamp-2 uppercase group-hover:text-primary transition-colors">${e.nombre}</h3>
        <div class="flex justify-between items-center mt-auto">
          <span class="text-[10px] font-black text-primary px-2.5 py-1 bg-primary/10 rounded-full truncate max-w-[65%]">${e.marca||`GENERICO`}</span>
          <div class="flex flex-col items-end">
            <span class="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">Stock</span>
            <span class="text-xs font-black text-slate-900">${e.stockActual}</span>
          </div>
        </div>
      </div>
    </div>
  `).join(``)}function Cn(){M.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();Sn(t?A.filter(e=>e.nombre.toLowerCase().includes(t)||e.sku.toLowerCase().includes(t)):A)}),document.addEventListener(`barcodeScanned`,e=>{let t=document.querySelector(`[data-view="pos"]`);if(!t||t.classList.contains(`hidden`))return;let n=e.detail,r=A.find(e=>e.sku===n||e.id===n);r?(window.posAddToCart(r.id),g(`✅ ${r.nombre} agregado`,`success`),document.activeElement===M&&(M.value=``,Sn(A),M.blur())):g(`Código ${n} no encontrado`,`warning`)}),document.getElementById(`pos-scan-btn`)?.addEventListener(`click`,()=>{gt({title:`Escanear`,onScan:e=>{M.value=e,M.dispatchEvent(new Event(`input`));let t=A.find(t=>t.sku===e||t.id===e);t?(window.posAddToCart(t.id),g(`✅ ${t.nombre} agregado`,`success`),setTimeout(()=>{M.value===e&&(M.value=``,M.dispatchEvent(new Event(`input`)))},1500)):g(`Código ${e} no encontrado en inventario`,`warning`)}})}),document.getElementById(`pos-reventa-btn`)?.addEventListener(`click`,()=>{window.__posReventaMode=!0,o(`inventory`),setTimeout(()=>{window.inventoryView&&window.inventoryView.openNuevo&&window.inventoryView.openNuevo(!0)},150)}),document.getElementById(`pos-select-client-btn`)?.addEventListener(`click`,()=>{nn(e=>{mn.value=e.nombre,pn.value=e.documento})}),window.posAddToCart=e=>{let t=A.find(t=>t.id===e);if(!t)return;let n=j.find(t=>t.id===e);if(n){if(n.qty>=t.stockActual)return g(`Sin stock`,`warning`);n.qty++}else j.push({...t,qty:1,precioManual:0});I(),setTimeout(()=>{let e=ln.querySelectorAll(`input[oninput*="posUpdatePrice"]`);e.length>0&&e[e.length-1].focus()},100)},window.posRemoveItem=e=>{j=j.filter(t=>t.id!==e),I()},window.posUpdateQty=(e,t)=>{let n=j.find(t=>t.id===e),r=A.find(t=>t.id===e);n&&(n.qty+=t,n.qty<=0?window.posRemoveItem(e):n.qty>r.stockActual&&(n.qty=r.stockActual),I())},window.posUpdatePrice=(e,t)=>{let n=j.find(t=>t.id===e),r=Number(t.value.replace(/\D/g,``));n&&(n.precioManual=r,t.value=new Intl.NumberFormat(`es-CO`).format(r),wn())},dn.addEventListener(`input`,I);let e=e=>{if(j.length!==0){if(!mn.value)return g(`Nombre cliente ok?`,`warning`);sn=e,Dn()}};document.getElementById(`pos-pay-btn-venta`)?.addEventListener(`click`,()=>e(`venta`)),document.getElementById(`pos-pay-btn-credito`)?.addEventListener(`click`,()=>e(`credito`)),document.getElementById(`pos-pay-btn-separe`)?.addEventListener(`click`,()=>e(`separe`)),gn.addEventListener(`click`,On),_n.addEventListener(`click`,On),N.addEventListener(`click`,kn)}function I(){if(j.length===0){ln.innerHTML=`
      <div class="flex flex-col items-center justify-center h-full text-on-surface-variant/50">
        <span class="material-symbols-outlined text-5xl mb-2" style="font-variation-settings:'FILL' 1">shopping_cart</span>
        <p class="text-sm font-medium">El carrito está vacío</p>
      </div>`,Tn(0);return}let e=0;ln.innerHTML=j.map(t=>{let n=t.precioManual||0;return e+=n*t.qty,`
    <div class="bg-white border-2 ${n===0?`border-orange-400 animate-pulse`:`border-slate-100`} p-3 rounded-2xl flex gap-3 shadow-sm transition-all">
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-black text-slate-800 truncate mb-1 uppercase">${t.nombre}</p>
        <div class="flex items-center bg-slate-50 rounded-lg px-2 border border-slate-200 focus-within:border-primary transition-colors">
          <span class="text-xs font-bold text-slate-400">$</span>
          <input type="text" 
            value="${n===0?``:new Intl.NumberFormat(`es-CO`).format(n)}" 
            placeholder="0"
            oninput="window.posUpdatePrice('${t.id}', this)" 
            class="w-full py-1.5 px-1 text-sm font-black text-primary bg-transparent outline-none placeholder:text-slate-300" />
        </div>
      </div>
      <div class="flex flex-col justify-between items-end">
        <button onclick="window.posRemoveItem('${t.id}')" class="text-slate-300 hover:text-red-500 transition-colors">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
        <div class="flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200">
          <button onclick="window.posUpdateQty('${t.id}', -1)" class="w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all text-slate-600 font-bold">-</button>
          <span class="text-xs font-black w-5 text-center text-slate-700">${t.qty}</span>
          <button onclick="window.posUpdateQty('${t.id}', 1)" class="w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center hover:bg-slate-50 active:scale-90 transition-all text-slate-600 font-bold">+</button>
        </div>
      </div>
    </div>`}).join(``),Tn(e)}function wn(){let e=0;j.forEach(t=>e+=(t.precioManual||t.precioVenta||0)*t.qty),Tn(e)}function Tn(e){let t=parseFloat(dn.value)||0;un.textContent=`$${new Intl.NumberFormat(`es-CO`).format(e)}`,fn.textContent=`$${new Intl.NumberFormat(`es-CO`).format(Math.max(0,e-t))}`}function En(){F=P.getContext(`2d`);let e=e=>{let t=P.getBoundingClientRect(),n=(e.touches?e.touches[0].clientX:e.clientX)-t.left,r=(e.touches?e.touches[0].clientY:e.clientY)-t.top;return{x:n*(P.width/t.width),y:r*(P.height/t.height)}},t=!1,n=n=>{t=!0,F.beginPath();let{x:r,y:i}=e(n);F.moveTo(r,i),n.preventDefault()},r=n=>{if(!t)return;let{x:r,y:i}=e(n);F.lineTo(r,i),F.stroke(),n.preventDefault()};P.addEventListener(`mousedown`,n),P.addEventListener(`mousemove`,r),P.addEventListener(`mouseup`,()=>t=!1),P.addEventListener(`touchstart`,n,{passive:!1}),P.addEventListener(`touchmove`,r,{passive:!1}),P.addEventListener(`touchend`,()=>t=!1),P.nextElementSibling.addEventListener(`click`,()=>F.clearRect(0,0,P.width,P.height))}function Dn(){hn.classList.remove(`hidden`),hn.classList.add(`flex`),P.width=P.offsetWidth,P.height=P.offsetHeight,F.lineWidth=2,F.lineCap=`round`,F.clearRect(0,0,P.width,P.height)}function On(){hn.classList.add(`hidden`),hn.classList.remove(`flex`)}async function kn(){if(!on){on=!0,N.textContent=`Subiendo archivos...`,N.disabled=!0;try{let e=``,t=``,n=document.createElement(`canvas`);if(n.width=P.width,n.height=P.height,P.toDataURL()!==n.toDataURL()){let t=await ne(P.toDataURL(`image/png`),`Firma_${Date.now()}.png`);e=typeof t==`string`?t:t?.url||``}if(vn.files[0]){N.textContent=`Subiendo evidencia...`;let e=vn.files[0],n=await re(await new Promise(t=>{let n=new FileReader;n.onload=e=>t(e.target.result),n.readAsDataURL(e)}),e.name,e.type);t=typeof n==`string`?n:n?.url||``}N.textContent=`Registrando venta...`;let r=Number(un.textContent.replace(/\D/g,``)),i=Number(fn.textContent.replace(/\D/g,``)),a=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`),o={cedula:pn.value.trim(),cliente:mn.value.trim(),productoNombre:j.map(e=>`${e.nombre} (x${e.qty})`).join(`, `),productoId:j[0]?.id,subtotal:r,descuento:Number(dn.value)||0,total:i,metodo:document.getElementById(`pos-metodo-pago`).value,vendedor:a.nombre||`Vendedor`,firmaComprador:e,evidencia:t},s=await Ce(o);s.success?(sn!==`venta`&&await Te({cliente:o.cliente,telefono:o.cedula,idFactura:s.idFactura,total:i,detalle:o.productoNombre,tipo:sn===`separe`?`Plan Separe`:`Crédito`}),g(`Venta Exitosa`,`success`),j=[],I(),pn.value=``,mn.value=``,On(),xn().then(()=>Sn(A))):g(`Error al guardar`,`error`)}catch(e){g(e.message,`error`)}finally{on=!1,N.textContent=`Confirmar y Facturar`,N.disabled=!1}}}var L=[],An=!1,jn=!1,Mn,Nn,Pn,Fn,In,Ln,Rn,zn,R,z,Bn,B,Vn,Hn,V,H,Un,Wn;function Gn(){return async()=>{Kn(),An||=(await qn(),Yn(),!0),Jn(L)}}function Kn(){Mn=document.getElementById(`imei-table-body`),Nn=document.getElementById(`imei-search`),Pn=document.getElementById(`imei-filter-status`),Fn=document.getElementById(`imei-new-btn`),In=document.getElementById(`imei-modal`),Ln=document.getElementById(`imei-modal-close`),Rn=document.getElementById(`imei-modal-backdrop`),zn=document.getElementById(`imei-form`),R=document.getElementById(`imei-save-btn`),z=document.getElementById(`imei-1`),Bn=document.getElementById(`imei-2`),B=document.getElementById(`imei-nombre`),Vn=document.getElementById(`imei-marca`),Hn=document.getElementById(`imei-proveedor`),V=document.getElementById(`imei-costo`),H=document.getElementById(`imei-venta`),Un=document.getElementById(`imei-estado`),Wn=document.getElementById(`imei-original`)}async function qn(){try{Mn.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando equipos...</td></tr>`,L=await ve();let e=await me();B.innerHTML=`<option value="">Seleccione un equipo...</option>`+e.map(e=>`<option value="${e.nombre}" data-marca="${e.marca}" data-costo="${e.costo}" data-precio="${e.precioVenta}" data-prov="${e.proveedor||``}" data-id="${e.id}">${e.nombre}${e.marca?` (`+e.marca+`)`:``}</option>`).join(``)}catch(e){g(`Error cargando equipos: `+e.message,`error`),L=[]}}function Jn(e){if(e.length===0){Mn.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron equipos</td></tr>`;return}let t=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).rol===`Administrador`;Mn.innerHTML=e.map(e=>{e.estado;let n=e.estado===`Disponible`?`bg-green-100 text-green-800`:e.estado===`Vendido`?`bg-red-100 text-red-800`:`bg-yellow-100 text-yellow-800`;return`
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3">
          <div class="font-mono text-xs font-bold text-on-surface">${e.imei1||`-`}</div>
          ${e.imei2?`<div class="font-mono text-[10px] text-on-surface-variant">${e.imei2}</div>`:``}
        </td>
        <td class="px-4 py-3">
          <p class="font-bold text-sm text-on-surface">${e.nombre||`-`}</p>
          <p class="text-[11px] text-on-surface-variant">${e.marca||`N/A`}</p>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${n}">
            ${e.estado||`Desconocido`}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${e.proveedor||`-`}</td>
        <td class="px-4 py-3">
          <p class="text-xs font-medium text-on-surface-variant line-through">$${new Intl.NumberFormat(`es-CO`).format(parseInt(String(e.costo||0).replace(/\D/g,``))||0)}</p>
          <p class="text-sm font-bold text-primary">$${new Intl.NumberFormat(`es-CO`).format(parseInt(String(e.venta||0).replace(/\D/g,``))||0)}</p>
        </td>
        <td class="px-4 py-3 text-right">
          ${t?`<button onclick="window.imeiEdit('${e.imei1}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>`:``}
          ${t?`<button onclick="window.imeiDelete('${e.imei1}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>`:``}
        </td>
      </tr>
    `}).join(``)}function Yn(){let e=()=>{let e=Nn.value.toLowerCase().trim(),t=Pn.value;Jn(L.filter(n=>{let r=(n.imei1||``).toLowerCase().includes(e)||(n.imei2||``).toLowerCase().includes(e)||(n.nombre||``).toLowerCase().includes(e),i=t?n.estado===t:!0;return r&&i}))},t=e=>{let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))};V.addEventListener(`input`,t),H.addEventListener(`input`,t),B.addEventListener(`change`,e=>{let t=e.target.selectedOptions[0];if(t&&t.value){Vn.value=t.dataset.marca||``,Hn.value=t.dataset.prov||``;let e=parseInt(String(t.dataset.costo||`0`).replace(/\D/g,``))||0,n=parseInt(String(t.dataset.precio||`0`).replace(/\D/g,``))||0;V.value=new Intl.NumberFormat(`es-CO`).format(e),H.value=new Intl.NumberFormat(`es-CO`).format(n)}else Vn.value=``,Hn.value=``,V.value=``,H.value=``}),Nn.addEventListener(`input`,e),Pn.addEventListener(`change`,e),document.getElementById(`imei-scan-btn`)?.addEventListener(`click`,()=>{gt({title:`Escanear IMEI`,onScan:t=>{Nn.value=t,e(),g(`IMEI: ${t}`,`info`)}})}),document.getElementById(`imei-scan-1`)?.addEventListener(`click`,()=>{gt({title:`Escanear IMEI 1`,onScan:e=>{z.value=e,g(`IMEI 1: ${e}`,`success`)}})}),document.getElementById(`imei-scan-2`)?.addEventListener(`click`,()=>{gt({title:`Escanear IMEI 2`,onScan:e=>{Bn.value=e,g(`IMEI 2: ${e}`,`success`)}})}),Fn.addEventListener(`click`,()=>Xn(null)),Ln.addEventListener(`click`,Zn),Rn.addEventListener(`click`,Zn),R.addEventListener(`click`,Qn),window.imeiEdit=e=>{let t=L.find(t=>t.imei1==e);t&&Xn(t)},window.imeiDelete=async t=>{if(confirm(`¿Eliminar el equipo con IMEI ${t}?`))try{g(`Eliminando...`,`info`);let n=await xe(t);n&&n.success?(g(`Equipo eliminado`,`success`),await qn(),e()):g(n.mensaje||`Error al eliminar`,`error`)}catch(e){g(`Error: `+e.message,`error`)}}}function Xn(e){zn.reset(),e?(Wn.value=e?e.imei1:``,z.value=e?e.imei1:``,Bn.value=e?e.imei2:``,B.value=e?e.nombre:``,Vn.value=e?e.marca:``,Hn.value=e?e.proveedor:``,V.value=e&&e.costo?new Intl.NumberFormat(`es-CO`).format(parseInt(String(e.costo).replace(/\D/g,``))||0):``,H.value=e&&e.venta?new Intl.NumberFormat(`es-CO`).format(parseInt(String(e.venta).replace(/\D/g,``))||0):``,Un.value=e?e.estado:`Disponible`,document.getElementById(`imei-modal-title`).textContent=`Editar Equipo`):(Wn.value=``,Un.value=`Disponible`,document.getElementById(`imei-modal-title`).textContent=`Registrar Equipo`),In.classList.remove(`hidden`),In.classList.add(`flex`)}function Zn(){In.classList.add(`hidden`),In.classList.remove(`flex`)}async function Qn(){if(!z.value.trim()){g(`El IMEI Principal es obligatorio`,`warning`),z.focus();return}if(!B.value){g(`Debe seleccionar un equipo del inventario`,`warning`),B.focus();return}if(!jn){jn=!0,R.textContent=`Guardando...`,R.disabled=!0;try{let e=Wn.value,t={imei1:z.value.trim(),imei2:Bn.value.trim(),nombre:B.value.trim(),marca:Vn.value.trim(),proveedor:Hn.value.trim(),costo:parseInt(V.value.replace(/\D/g,``))||0,venta:parseInt(H.value.replace(/\D/g,``))||0,estado:Un.value},n;n=e?await be(e,t):await ye(t),n&&n.success?(g(`Equipo guardado`,`success`),Zn(),await qn(),Jn(L)):g(n?.mensaje||`Error al guardar`,`error`)}catch(e){g(`Error de conexión: `+e.message,`error`)}finally{jn=!1,R.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`,R.disabled=!1}}}var U=[],$n=!1,er=!1,tr,nr,rr,ir,ar,or,sr,W,cr,lr,ur,dr,fr,pr,mr;function hr(){return async()=>{gr(),$n||=(await _r(),yr(),!0),vr(U)}}function gr(){tr=document.getElementById(`cli-table-body`),nr=document.getElementById(`cli-search`),rr=document.getElementById(`cli-new-btn`),ir=document.getElementById(`cli-modal`),ar=document.getElementById(`cli-modal-close`),or=document.getElementById(`cli-modal-backdrop`),sr=document.getElementById(`cli-form`),W=document.getElementById(`cli-save-btn`),cr=document.getElementById(`cli-doc`),lr=document.getElementById(`cli-nombre`),ur=document.getElementById(`cli-tel`),dr=document.getElementById(`cli-email`),fr=document.getElementById(`cli-dir`),pr=document.getElementById(`cli-tipo`),mr=document.getElementById(`cli-original`)}async function _r(){try{tr.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando clientes...</td></tr>`,U=await ue()}catch(e){g(`Error cargando clientes: `+e.message,`error`),U=[]}}function vr(e){if(e.length===0){tr.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron clientes</td></tr>`;return}let t=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).rol===`Administrador`;tr.innerHTML=e.map(e=>{let n=e.tipo===`VIP`?`bg-amber-100 text-amber-800`:e.tipo===`Empresa`?`bg-blue-100 text-blue-800`:e.tipo===`Mayorista`?`bg-purple-100 text-purple-800`:`bg-surface-container text-on-surface-variant`;return`
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3 font-mono text-xs font-bold text-on-surface">${e.cedula||`-`}</td>
        <td class="px-4 py-3">
          <p class="font-bold text-sm text-on-surface">${e.nombre||`-`}</p>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1.5 text-sm text-on-surface-variant mb-0.5">
            <span class="material-symbols-outlined text-[14px]">call</span> ${e.telefono||`-`}
          </div>
          ${e.email?`<div class="flex items-center gap-1.5 text-xs text-on-surface-variant"><span class="material-symbols-outlined text-[14px]">mail</span> ${e.email}</div>`:``}
        </td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${e.direccion||`-`}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${n}">
            ${e.tipo||`Normal`}
          </span>
        </td>
        <td class="px-4 py-3 text-right">
          ${t?`<button onclick="window.cliEdit('${e.cedula}')" class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>`:``}
          ${t?`<button onclick="window.cliDelete('${e.cedula}')" class="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>`:``}
        </td>
      </tr>
    `}).join(``)}function yr(){let e=()=>{let e=nr.value.toLowerCase().trim();vr(U.filter(t=>(t.cedula||``).toLowerCase().includes(e)||(t.nombre||``).toLowerCase().includes(e)||(t.telefono||``).toLowerCase().includes(e)))};nr.addEventListener(`input`,e),rr.addEventListener(`click`,()=>br(null)),ar.addEventListener(`click`,xr),or.addEventListener(`click`,xr),W.addEventListener(`click`,Sr),window.cliEdit=e=>{let t=U.find(t=>t.cedula==e);t&&br(t)},window.cliDelete=async t=>{if(confirm(`¿Eliminar al cliente con documento ${t}?`))try{g(`Eliminando...`,`info`);let n=await pe(t);n&&n.success?(g(`Cliente eliminado`,`success`),await _r(),e()):g(n.mensaje||`Error al eliminar`,`error`)}catch(e){g(`Error: `+e.message,`error`)}}}function br(e){sr.reset(),e?(mr.value=e.cedula,cr.value=e.cedula,lr.value=e.nombre||``,ur.value=e.telefono||``,dr.value=e.email||``,fr.value=e.direccion||``,pr.value=e.tipo||`Normal`,document.getElementById(`cli-modal-title`).textContent=`Editar Cliente`):(mr.value=``,pr.value=`Normal`,document.getElementById(`cli-modal-title`).textContent=`Nuevo Cliente`),ir.classList.remove(`hidden`),ir.classList.add(`flex`)}function xr(){ir.classList.add(`hidden`),ir.classList.remove(`flex`)}async function Sr(){if(!sr.checkValidity()){sr.reportValidity();return}if(!er){er=!0,W.textContent=`Guardando...`,W.disabled=!0;try{let e=mr.value,t={cedula:cr.value.trim(),nombre:lr.value.trim(),telefono:ur.value.trim(),email:dr.value.trim(),direccion:fr.value.trim(),tipo:pr.value},n;n=e?await fe(e,t):await de(t),n&&n.success?(g(`Cliente guardado`,`success`),xr(),await _r(),vr(U)):g(n?.mensaje||`Error al guardar`,`error`)}catch(e){g(`Error de conexión: `+e.message,`error`)}finally{er=!1,W.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`,W.disabled=!1}}}var G=[],Cr=!1,wr=!1;function Tr(){return async()=>{Cr||=(await Er(),Mr(),!0),jr(G)}}async function Er(){let e=document.getElementById(`cred-table-body`);e&&(e.innerHTML=`<tr><td colspan="9" class="p-6 text-center text-on-surface-variant">Cargando créditos...</td></tr>`);try{G=await we()}catch(e){g(`Error cargando créditos: `+e.message,`error`),G=[]}}var K=e=>`$`+new Intl.NumberFormat(`es-CO`).format(Math.round(e||0));function Dr(e,t){if(!e)return 0;let n=e=>{if(!e)return null;let t=String(e).split(`/`);return t.length===3?new Date(t[2],t[1]-1,t[0]):new Date(e)},r=n(e),i=t?n(t):new Date;return!r||isNaN(r)?0:Math.max(0,Math.floor((i-r)/864e5))}function Or(e){return e?e.split(`;`).filter(Boolean).map(e=>{let t=e.split(`|`);return{fecha:t[0]||``,monto:parseFloat(t[1])||0,nota:t[2]||``}}):[]}function kr(e){return e.map(e=>`${e.fecha}|${e.monto}|${e.nota}`).join(`;`)}function Ar(e){let t=0,n=0;e.forEach(e=>{e.estado!==`Cancelado`&&(t+=e.saldo||0),n+=e.abonado||0});let r=document.getElementById(`cred-stat-total`),i=document.getElementById(`cred-stat-recaudo`);r&&(r.textContent=K(t)),i&&(i.textContent=K(n))}function jr(e){Ar(G);let t=document.getElementById(`cred-table-body`);if(t){if(e.length===0){t.innerHTML=`<tr><td colspan="9" class="p-6 text-center text-on-surface-variant">No se encontraron créditos</td></tr>`;return}t.innerHTML=e.map(e=>{let t=e.estado===`Cancelado`||e.estado===`Entregado`,n=Dr(e.fecha,t?e.fechaCancelacion:null),r=t?`bg-green-100 text-green-800`:e.estado===`En Mora`?`bg-red-100 text-red-800`:`bg-orange-100 text-orange-800`,i=e.tipo===`Plan Separe`?`bg-emerald-100 text-emerald-800 border-emerald-200`:`bg-blue-100 text-blue-800 border-blue-200`,a=t?`<span class="text-[10px] text-on-surface-variant">Pagó en ${n}d</span>`:`<span class="text-[10px] font-bold ${n>30?`text-red-500`:`text-orange-500`}">${n} días</span>`,o=String(e.telefono||``).replace(/\D/g,``),s=`https://wa.me/57${o}?text=${encodeURIComponent(`Hola ${e.cliente}, le recordamos que tiene un saldo pendiente de ${K(e.saldo)} con nosotros. Gracias.`)}`;return`
      <tr class="hover:bg-surface-container-low transition-colors ${t?`opacity-70`:``}">
        <td class="px-4 py-3">
          <p class="font-bold text-sm text-on-surface">${e.cliente||`-`}</p>
          <p class="text-[11px] text-on-surface-variant">${e.telefono||``}</p>
        </td>
        <td class="px-4 py-3 font-mono text-xs text-on-surface-variant">${e.idFactura||`-`}</td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${e.fecha||`-`}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${i}">${e.tipo||`Crédito`}</span>
        </td>
        <td class="px-4 py-3 text-sm font-medium">${K(e.total)}</td>
        <td class="px-4 py-3 text-sm font-medium text-green-600">${K(e.abonado)}</td>
        <td class="px-4 py-3 text-sm font-black text-error">${K(e.saldo)}</td>
        <td class="px-4 py-3 text-center">${a}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${r}">${e.estado||`Activo`}</span>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1 justify-end">
            ${o?`<a href="${s}" target="_blank"
                class="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Enviar WhatsApp">
                <span class="material-symbols-outlined text-[18px]">chat</span>
              </a>`:``}
            ${t?`<span class="text-xs text-green-600 font-semibold">✓ Pagado</span>`:`<button onclick="window.credAddAbono('${e.id}')"
                class="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-lg text-xs font-bold transition-colors">
                Abonar
              </button>`}
          </div>
        </td>
      </tr>
    `}).join(``)}}function Mr(){let e=document.getElementById(`cred-search`),t=document.getElementById(`cred-filter-status`),n=document.getElementById(`cred-filter-tipo`),r=()=>{let r=(e?.value||``).toLowerCase().trim(),i=t?.value||``,a=n?.value||``;jr(G.filter(e=>{let t=(e.cliente||``).toLowerCase().includes(r)||(e.idFactura||``).toLowerCase().includes(r),n=i?e.estado===i:!0,o=a?(e.tipo||`Crédito`)===a:!0;return t&&n&&o}))};e?.addEventListener(`input`,r),t?.addEventListener(`change`,r),n?.addEventListener(`change`,r);let i=e=>{let t=e.target.value.replace(/\D/g,``);e.target.value=t?new Intl.NumberFormat(`es-CO`).format(parseInt(t)):``};document.getElementById(`cred-new-total`)?.addEventListener(`input`,i),document.getElementById(`cred-new-abono`)?.addEventListener(`input`,i),document.getElementById(`cred-monto-abono`)?.addEventListener(`input`,i);let a=document.getElementById(`cred-modal`),o=document.getElementById(`cred-modal-close`),s=document.getElementById(`cred-modal-backdrop`),c=document.getElementById(`cred-save-btn`),l=()=>{a?.classList.add(`hidden`),a?.classList.remove(`flex`)};o?.addEventListener(`click`,l),s?.addEventListener(`click`,l),window.credAddAbono=e=>{let t=G.find(t=>t.id==e);if(!t)return;document.getElementById(`cred-id`).value=t.id,document.getElementById(`cred-cliente-name`).textContent=t.cliente,document.getElementById(`cred-saldo-actual`).textContent=K(t.saldo);let n=Or(t.historialAbonos),r=document.getElementById(`cred-historial`);r&&(r.innerHTML=n.length===0?`<p class="text-xs text-on-surface-variant">Sin abonos anteriores</p>`:n.map(e=>`
            <div class="flex justify-between items-center py-1 border-b border-surface-variant text-xs">
              <span class="text-on-surface-variant">${e.fecha}</span>
              <span class="font-bold text-green-600">${K(e.monto)}</span>
              <span class="text-on-surface-variant">${e.nota||``}</span>
            </div>`).join(``)),document.getElementById(`cred-monto-abono`).value=``,document.getElementById(`cred-nota-abono`).value=``,a?.classList.remove(`hidden`),a?.classList.add(`flex`),document.getElementById(`cred-monto-abono`)?.focus()},c?.addEventListener(`click`,async()=>{let e=document.getElementById(`cred-id`).value,t=parseInt((document.getElementById(`cred-monto-abono`).value||``).replace(/\D/g,``))||0,n=(document.getElementById(`cred-nota-abono`)?.value||``).trim();if(!t||t<=0){g(`Ingresa un monto válido`,`warning`);return}if(!wr){wr=!0,c.textContent=`Aplicando...`,c.disabled=!0;try{let r=G.find(t=>t.id==e),i=(r.abonado||0)+t,a=Math.max(0,(r.total||0)-i),o=a<=0,s=Or(r.historialAbonos);s.push({fecha:new Date().toLocaleDateString(`es-CO`),monto:t,nota:n});let c=r.tipo===`Plan Separe`,u=c?`Separado`:`Activo`,d=c?`Entregado`:`Cancelado`,f=await Ee(e,{...r,abonado:i,saldo:a,estado:o||r.estado===`Cancelado`||r.estado===`Entregado`?d:u,fechaCancelacion:o?new Date().toLocaleDateString(`es-CO`):r.fechaCancelacion||``,historialAbonos:kr(s)});f?.success?(g(o?`✅ ¡Crédito cancelado!`:`Abono registrado`,`success`),l(),Cr=!1,await Er(),jr(G)):g(f?.mensaje||`Error al guardar`,`error`)}catch(e){g(`Error: `+e.message,`error`)}finally{wr=!1,c.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Aplicar Abono`,c.disabled=!1}}});let u=document.getElementById(`cred-new-modal`),d=()=>{u?.classList.add(`hidden`),u?.classList.remove(`flex`)};document.getElementById(`cred-new-btn`)?.addEventListener(`click`,()=>{document.getElementById(`cred-new-form`)?.reset(),document.getElementById(`cred-new-cliente`).value=``,document.getElementById(`cred-new-cliente-doc`).value=``,u?.classList.remove(`hidden`),u?.classList.add(`flex`)}),document.getElementById(`cred-new-close`)?.addEventListener(`click`,d),document.getElementById(`cred-new-backdrop`)?.addEventListener(`click`,d),document.getElementById(`cred-select-client-btn`)?.addEventListener(`click`,()=>{nn(e=>{document.getElementById(`cred-new-cliente`).value=e.nombre,document.getElementById(`cred-new-cliente-doc`).value=e.cedula||e.documento||e.telefono||``})}),document.getElementById(`cred-save-new-btn`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`cred-new-cliente`).value.trim(),t=document.getElementById(`cred-new-cliente-doc`).value.trim(),n=parseInt((document.getElementById(`cred-new-total`).value||``).replace(/\D/g,``))||0,r=parseInt((document.getElementById(`cred-new-abono`)?.value||``).replace(/\D/g,``))||0,i=document.getElementById(`cred-new-detalle`).value.trim();if(!e||!n){g(`Cliente y monto son requeridos`,`warning`);return}let a=document.getElementById(`cred-save-new-btn`);a.disabled=!0,a.textContent=`Guardando...`;try{let a=await Te({cliente:e,telefono:t,total:n,detalle:i,historialAbonos:r>0?kr([{fecha:new Date().toLocaleDateString(`es-CO`),monto:r,nota:`Abono inicial`}]):``});a?.success?(g(`Crédito creado`,`success`),d(),Cr=!1,await Er(),jr(G)):g(a?.mensaje||`Error al crear crédito`,`error`)}catch(e){g(`Error: `+e.message,`error`)}finally{a.disabled=!1,a.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`}})}var Nr=[],Pr=[];function Fr(){return async()=>{document.getElementById(`sales-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();Pr=Nr.filter(e=>(e.id_factura||``).toLowerCase().includes(t)||(e.cliente||``).toLowerCase().includes(t)||(e.cedula||``).toLowerCase().includes(t)),Lr()});let e=()=>{let e=document.getElementById(`sale-detail-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)};document.getElementById(`sale-detail-close`)?.addEventListener(`click`,e),document.getElementById(`sale-detail-backdrop`)?.addEventListener(`click`,e),await Ir()}}async function Ir(){let e=document.getElementById(`sales-history-list`);if(e)try{e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">Cargando todas las ventas...</td></tr>`,Nr=await Se(),Pr=[...Nr],Lr()}catch(t){e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-error italic text-sm">Error: ${t.message}</td></tr>`}}function Lr(){let e=document.getElementById(`sales-history-list`);if(e){if(Pr.length===0){e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">No se encontraron ventas</td></tr>`;return}e.innerHTML=Pr.map((e,t)=>{let n=new Date(e.fecha).toLocaleDateString(`es-CO`,{day:`2-digit`,month:`short`}),r=new Intl.NumberFormat(`es-CO`).format(e.total||0);return`
      <tr class="hover:bg-surface-container-low transition-colors text-[13px]">
        <td class="px-4 py-4 text-center text-on-surface-variant font-medium">${t+1}</td>
        <td class="px-4 py-4">
          <div class="font-bold text-on-surface text-sm">${e.id_factura}</div>
          <div class="text-[10px] text-on-surface-variant uppercase">${n}</div>
        </td>
        <td class="px-4 py-4">
          <div class="font-bold text-on-surface">${e.cliente||`Consumidor Final`}</div>
          <div class="text-[10px] text-on-surface-variant">CC: ${e.cedula||`N/A`}</div>
        </td>
        <td class="px-4 py-4 font-medium text-on-surface-variant">${e.vendedor||`—`}</td>
        <td class="px-4 py-4">
          <div class="text-xs text-on-surface font-semibold truncate max-w-[150px]">${e.productos}</div>
          <div class="text-[10px] text-primary font-bold">IMEI: ${e.imeis||`N/A`}</div>
        </td>
        <td class="px-4 py-4 text-right font-black text-on-surface text-sm">
          $${r}
        </td>
        <td class="px-4 py-4 text-center">
           <button onclick="window.viewSaleDetail('${e.id_factura}')" class="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
           </button>
        </td>
      </tr>
    `}).join(``)}}window.viewSaleDetail=e=>{let t=Nr.find(t=>t.id_factura===e);if(!t)return;let n=document.getElementById(`sale-detail-modal`),r=document.getElementById(`sale-detail-content`),i=e=>new Intl.NumberFormat(`es-CO`).format(e||0);r.innerHTML=`
    <div class="space-y-6">
      <div class="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <p class="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Comprobante de Venta</p>
          <p class="text-2xl font-black text-slate-900">${t.id_factura}</p>
          <p class="text-xs text-slate-500 font-medium">${new Date(t.fecha).toLocaleString(`es-CO`)}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Pagado</span>
          <p class="text-[11px] text-slate-500 mt-2 font-bold">${t.metodo}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Información del Cliente</p>
          <p class="text-sm font-black text-slate-900">${t.cliente}</p>
          <p class="text-xs text-slate-600">ID/Cédula: ${t.cedula||`N/A`}</p>
          <p class="text-xs text-slate-600 mt-1"><span class="font-bold text-slate-400">Dirección:</span> ${t.direccion||`Sin dirección`}</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Atendido por</p>
          <p class="text-sm font-black text-slate-900">${t.vendedor}</p>
          <p class="text-xs text-slate-500 italic">Vendedor Autorizado</p>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Detalle de Productos</p>
        <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
           <div class="flex justify-between text-sm font-bold text-slate-800 mb-1">
              <span>${t.productos}</span>
              <span>x${t.cantidad||1}</span>
           </div>
           <p class="text-[11px] text-primary font-mono font-bold uppercase tracking-tighter">IMEI/SERIE: ${t.imeis||`N/A`}</p>
        </div>
      </div>

      <div class="bg-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
        <div class="relative z-10 flex justify-between items-end">
          <div class="space-y-1">
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Resumen Financiero</p>
            <p class="text-xs opacity-80">Subtotal: $${i(t.subtotal)}</p>
            <p class="text-xs text-red-400 font-bold">Descuento: -$${i(t.descuento)}</p>
          </div>
          <div class="text-right">
            <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Cobrado</p>
            <p class="text-3xl font-black text-white leading-none mt-1">$${i(t.total)}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Firma Vend.</p>
           ${t.id_firma_vendedor?`<a href="${t.id_firma_vendedor}" target="_blank" class="h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200"><span class="material-symbols-outlined text-slate-400 text-sm">signature</span></a>`:`<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Firma Cli.</p>
           ${t.id_firma_comprador?`<a href="${t.id_firma_comprador}" target="_blank" class="h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200"><span class="material-symbols-outlined text-slate-400 text-sm">person_check</span></a>`:`<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
        <div class="flex flex-col gap-2 text-center">
           <p class="text-[9px] uppercase font-bold text-slate-400">Evidencia</p>
           ${t.evidencia?`<a href="${t.evidencia}" target="_blank" class="h-12 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/20"><span class="material-symbols-outlined text-primary/40 text-sm">image</span></a>`:`<div class="h-12 bg-slate-50 rounded-lg border border-slate-100"></div>`}
        </div>
      </div>
    </div>
  `,n.classList.remove(`hidden`),n.classList.add(`flex`)};var Rr=[],zr=!1;function Br(){return async()=>{Vr(),zr||=(await Hr(),!0)}}function Vr(){let e=document.getElementById(`task-new-btn`),t=document.getElementById(`task-modal-close`),n=document.getElementById(`task-modal-backdrop`),r=document.getElementById(`task-form`);e?.replaceWith(e.cloneNode(!0)),t?.replaceWith(t.cloneNode(!0)),n?.replaceWith(n.cloneNode(!0)),r?.replaceWith(r.cloneNode(!0)),document.getElementById(`task-new-btn`)?.addEventListener(`click`,Kr),document.getElementById(`task-modal-close`)?.addEventListener(`click`,qr),document.getElementById(`task-modal-backdrop`)?.addEventListener(`click`,qr),document.getElementById(`task-form`)?.addEventListener(`submit`,Jr)}async function Hr(){let e=document.getElementById(`task-list`);try{let e=await Be(),t=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`);Rr=t.rol===`Técnico de reparación`||t.rol===`Vendedor`?e.filter(e=>e.responsable===t.nombre):e,Ur()}catch(t){e.innerHTML=`<li class="p-8 text-center text-error">Error: ${t.message}</li>`}}function Ur(){let e=document.getElementById(`task-list`);if(!Rr||Rr.length===0){e.innerHTML=`<li class="p-12 text-center text-on-surface-variant italic text-sm">No hay tareas. ¡Buen trabajo!</li>`;return}e.innerHTML=Rr.map(e=>{let t=e.estado===`Completada`;return`
      <li class="flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors group">
        <button onclick="window.toggleTaskStatus('${e.id}', '${e.estado}')" 
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all 
          ${t?`bg-green-500 border-green-500`:`border-surface-variant hover:border-primary`}">
          ${t?`<span class="material-symbols-outlined text-white text-[16px]">done</span>`:``}
        </button>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm ${t?`text-on-surface-variant line-through opacity-50`:`text-on-surface`}">${e.tarea}</h4>
          <p class="text-[11px] text-on-surface-variant truncate">${e.notas||`Sin notas`}</p>
        </div>
        <div class="text-right">
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full ${Wr(e.prioridad)}">${e.prioridad}</span>
          <p class="text-[10px] text-on-surface-variant mt-1">${Gr(e.fecha_vencimiento)}</p>
        </div>
        <button onclick="window.deleteTask('${e.id}')" class="p-2 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </li>
    `}).join(``)}function Wr(e){return e===`Alta`?`bg-red-100 text-red-700`:e===`Media`?`bg-blue-100 text-blue-700`:`bg-slate-100 text-slate-700`}function Gr(e){return e?new Date(e+`T12:00:00`).toLocaleDateString(`es-CO`,{day:`numeric`,month:`short`}):`—`}function Kr(){let e=document.getElementById(`task-modal`);document.getElementById(`task-form`).reset(),document.getElementById(`task-input-date`).value=new Date().toISOString().slice(0,10),e.classList.remove(`hidden`),e.classList.add(`flex`)}function qr(){document.getElementById(`task-modal`).classList.add(`hidden`),document.getElementById(`task-modal`).classList.remove(`flex`)}async function Jr(e){e.preventDefault();let t=document.getElementById(`task-save-btn`);t.disabled=!0,t.innerHTML=`Guardando...`;let n={tarea:document.getElementById(`task-input-title`).value.trim(),fecha_inicio:new Date().toISOString().slice(0,10),fecha_vencimiento:document.getElementById(`task-input-date`).value,prioridad:document.getElementById(`task-input-priority`).value,responsable:JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).nombre||`Admin`,notas:document.getElementById(`task-input-notes`).value.trim(),estado:`Pendiente`,color:Yr(document.getElementById(`task-input-priority`).value)};try{await Ve(n)&&(g(`Tarea creada`,`success`),qr(),await Hr())}catch{g(`Error al guardar`,`error`)}finally{t.disabled=!1,t.innerHTML=`<span class="material-symbols-outlined text-[20px]">save</span> Guardar Tarea`}}function Yr(e){return e===`Alta`?`#ef4444`:e===`Media`?`#3b82f6`:`#64748b`}window.toggleTaskStatus=async(e,t)=>{let n=t===`Completada`?`Pendiente`:`Completada`;try{await He(e,n),await Hr()}catch(e){console.error(e)}},window.deleteTask=async e=>{if(confirm(`¿Eliminar tarea?`))try{await Ue(e),await Hr()}catch(e){console.error(e)}};var q=[],Xr=!1;function Zr(){return async()=>{Xr||=(await Qr(),!0),$r()}}async function Qr(){let e=document.getElementById(`calendar-container`);e&&(e.innerHTML=`<div class="p-10 text-center text-on-surface-variant italic animate-pulse">Recopilando actividad global...</div>`);try{let e=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`),t=e.rol===`Administrador`,n=[Se().catch(()=>[]),Be().catch(()=>[]),De().catch(()=>[])];t&&(n.push(Fe().catch(()=>[])),n.push(Le().catch(()=>[])));let[r,i,a,o=[],s=[]]=await Promise.all(n);q=[],r.forEach(e=>{e.fecha&&q.push({fecha:new Date(e.fecha),tipo:`Venta`,icono:`point_of_sale`,color:`text-green-600`,bg:`bg-green-100`,border:`border-green-200`,titulo:`Factura: ${e.id_factura||`N/A`}`,subtitulo:`Cliente: ${e.cliente||`Consumidor Final`}`,monto:e.total,signo:`+`,usuario:e.vendedor||`Admin`})}),i.forEach(e=>{e.fecha_vencimiento&&q.push({fecha:new Date(e.fecha_vencimiento),tipo:`Tarea`,icono:`task_alt`,color:`text-indigo-600`,bg:`bg-indigo-100`,border:`border-indigo-200`,titulo:e.tarea,subtitulo:`Resp: ${e.responsable||`Sin asignar`}`,monto:null,usuario:e.responsable||`Admin`})}),a.forEach(e=>{e.fecha&&q.push({fecha:new Date(e.fecha),tipo:`Reventa`,icono:`storefront`,color:`text-purple-600`,bg:`bg-purple-100`,border:`border-purple-200`,titulo:`Reventa: ${e.producto}`,subtitulo:`Proveedor: ${e.proveedor||`N/A`}`,monto:e.utilidad,signo:`+`,usuario:e.vendedor||`Admin`})}),o.forEach(e=>{e.fecha&&q.push({fecha:new Date(e.fecha),tipo:`Egreso`,icono:`payments`,color:`text-red-600`,bg:`bg-red-100`,border:`border-red-200`,titulo:`Gasto: ${e.concepto}`,subtitulo:`Cat: ${e.categoria}`,monto:e.monto,signo:`-`})}),s.forEach(e=>{e.fecha&&q.push({fecha:new Date(e.fecha),tipo:`Nómina`,icono:`request_quote`,color:`text-orange-600`,bg:`bg-orange-100`,border:`border-orange-200`,titulo:`Pago: ${e.empleado}`,subtitulo:`Período: ${e.periodo}`,monto:e.total_pagar,signo:`-`})}),q.sort((e,t)=>t.fecha-e.fecha),t||(q=q.filter(t=>t.usuario===e.nombre))}catch(t){console.error(t),e&&(e.innerHTML=`<div class="p-10 text-center text-error font-bold">Error cargando actividad: ${t.message}</div>`)}}function $r(){let e=document.getElementById(`calendar-container`);if(!e)return;if(q.length===0){e.innerHTML=`
      <div class="flex-1 flex flex-col items-center justify-center p-10 opacity-50">
        <span class="material-symbols-outlined text-[64px] mb-4">history_toggle_off</span>
        <p class="text-lg font-bold">Sin actividad</p>
        <p class="text-sm">No hay registros de operaciones en el sistema.</p>
      </div>`;return}let t={};q.forEach(e=>{let n=e.fecha.toISOString().split(`T`)[0];t[n]||(t[n]=[]),t[n].push(e)});let n=e=>new Intl.NumberFormat(`es-CO`,{style:`currency`,currency:`COP`,minimumFractionDigits:0}).format(e),r=``,i=new Date().toISOString().split(`T`)[0],a=new Date;a.setDate(a.getDate()-1);let o=a.toISOString().split(`T`)[0];Object.keys(t).forEach(e=>{let a=t[e],s=e,c=`text-on-surface-variant`,l=`bg-surface-variant`;e===i?(s=`Hoy`,c=`text-primary`,l=`bg-primary`):e===o?s=`Ayer`:(s=new Date(e+`T12:00:00`).toLocaleDateString(`es-CO`,{weekday:`long`,day:`numeric`,month:`long`}),s=s.charAt(0).toUpperCase()+s.slice(1)),r+=`
      <!-- Day Group -->
      <div class="relative">
        <!-- Date Header -->
        <div class="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 rounded-full border-4 border-surface ${l} z-10"></div>
        <h3 class="text-sm font-black uppercase tracking-widest ${c} mb-4">${s}</h3>
        
        <div class="flex flex-col gap-3 mb-8">
    `,a.forEach(e=>{let t=e.fecha.toLocaleTimeString(`es-CO`,{hour:`2-digit`,minute:`2-digit`}),i=``;e.monto!==null&&e.monto!==void 0&&(i=`<div class="font-black ${e.signo===`+`?`text-green-600`:`text-red-600`} whitespace-nowrap">${e.signo} ${n(e.monto)}</div>`),r+=`
        <div class="bg-surface-container-lowest border border-surface-variant hover:border-primary/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-4 group">
          
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${e.bg} ${e.border} border">
            <span class="material-symbols-outlined ${e.color} text-[24px]" style="font-variation-settings:'FILL' 1">${e.icono}</span>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-[10px] font-black uppercase tracking-widest ${e.color}">${e.tipo}</span>
              <span class="text-[10px] text-on-surface-variant flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">schedule</span> ${t}</span>
            </div>
            <h4 class="text-sm font-bold text-on-surface truncate">${e.titulo}</h4>
            <p class="text-xs text-on-surface-variant truncate">${e.subtitulo}</p>
          </div>
          
          <!-- Amount -->
          ${i}
        </div>
      `}),r+=`
        </div>
      </div>
    `}),e.innerHTML=r}var J=[],ei=!1,ti=!1,ni=null;function ri(){return async()=>{ei||=(await ii(),oi(),!0),ai(J)}}async function ii(){let e=document.getElementById(`user-table-body`);try{e&&(e.innerHTML=`<tr><td colspan="5" class="p-8 text-center opacity-50">Cargando equipo...</td></tr>`),J=await oe()}catch{g(`Error al cargar usuarios`,`error`),J=[]}}function ai(e){let t=document.getElementById(`user-table-body`);if(t){if(e.length===0){t.innerHTML=`<tr><td colspan="5" class="p-10 text-center opacity-40 italic">No hay usuarios registrados</td></tr>`;return}t.innerHTML=e.map(e=>`
    <tr class="hover:bg-surface-container-low transition-colors text-sm border-b border-surface-variant/30">
      <td class="px-4 py-4 font-bold text-on-surface">${e.nombre}</td>
      <td class="px-4 py-4 text-on-surface-variant">${e.email}</td>
      <td class="px-4 py-4 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${e.rol===`Administrador`?`bg-purple-100 text-purple-700`:`bg-blue-100 text-blue-700`}">${e.rol}</span>
      </td>
      <td class="px-4 py-4 text-center">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${e.estado===`Activo`?`bg-green-100 text-green-700`:`bg-slate-100 text-slate-500`}">
          <span class="w-1.5 h-1.5 rounded-full ${e.estado===`Activo`?`bg-green-600`:`bg-slate-400`}"></span>
          ${e.estado}
        </span>
      </td>
      <td class="px-4 py-4 text-right space-x-1">
        <button onclick="window.userEdit('${e.email}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg" title="Editar"><span class="material-symbols-outlined text-[18px]">edit</span></button>
        <button onclick="window.userDelete('${e.email}')" class="p-1.5 text-on-surface-variant hover:text-error rounded-lg" title="Eliminar"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </td>
    </tr>
  `).join(``)}}function oi(){document.getElementById(`user-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();ai(J.filter(e=>e.nombre.toLowerCase().includes(t)||e.email.toLowerCase().includes(t)))}),document.getElementById(`user-new-btn`)?.addEventListener(`click`,()=>si()),document.getElementById(`user-modal-close`)?.addEventListener(`click`,ci),document.getElementById(`user-modal-backdrop`)?.addEventListener(`click`,ci),document.getElementById(`user-form`)?.addEventListener(`submit`,li),window.userEdit=e=>{let t=J.find(t=>t.email===e);t&&si(t)},window.userDelete=async e=>{if(e===JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).email)return g(`No puedes eliminarte a ti mismo`,`warning`);if(confirm(`¿Eliminar al usuario ${e}?`))try{await le(e),g(`Usuario eliminado`,`success`),await ii(),ai(J)}catch(e){g(e.message,`error`)}}}function si(e=null){ni=e?e.email:null,document.getElementById(`user-form`).reset(),document.getElementById(`user-modal-title`).textContent=e?`Editar Usuario`:`Nuevo Usuario`,e&&(document.getElementById(`user-input-name`).value=e.nombre,document.getElementById(`user-input-email`).value=e.email,document.getElementById(`user-input-password`).value=e.password,document.getElementById(`user-input-rol`).value=e.rol,document.getElementById(`user-input-estado`).value=e.estado);let t=document.getElementById(`user-modal`);t.classList.remove(`hidden`),t.classList.add(`flex`)}function ci(){let e=document.getElementById(`user-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)}async function li(e){if(e.preventDefault(),ti)return;ti=!0;let t=document.getElementById(`user-save-btn`);t.disabled=!0,t.innerHTML=`Guardando...`;let n=e=>document.getElementById(e).value.trim(),r=n(`user-input-email`).toLowerCase(),i=[r,n(`user-input-password`),n(`user-input-name`),n(`user-input-rol`),n(`user-input-estado`)];try{ni?await ce(ni,r,[i[1],i[2],i[3],i[4]]):await se(i),g(ni?`Actualizado`:`Creado`,`success`),ci(),await ii(),ai(J)}catch(e){g(e.message,`error`)}finally{ti=!1,t.disabled=!1,t.innerHTML=`Guardar Usuario`}}var Y=[],ui=!1,di=!1,X,fi,pi,mi,Z,hi,gi,_i,vi,yi,bi,xi,Si,Ci,wi;function Ti(){return async()=>{Ei(),ui||=(await Di(),ki(),!0),Oi(Y)}}function Ei(){X=document.getElementById(`ped-table-body`),fi=document.getElementById(`ped-search`),pi=document.getElementById(`ped-filter-status`),mi=document.getElementById(`ped-new-btn`),Z=document.getElementById(`ped-modal`),hi=document.getElementById(`ped-modal-close`),gi=document.getElementById(`ped-modal-backdrop`),_i=document.getElementById(`ped-form`),vi=document.getElementById(`ped-save-btn`),yi=document.getElementById(`ped-id`),bi=document.getElementById(`ped-producto`),xi=document.getElementById(`ped-categoria`),Si=document.getElementById(`ped-proveedor`),Ci=document.getElementById(`ped-costo`),wi=document.getElementById(`ped-precio`)}async function Di(){try{X&&(X.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando reventas...</td></tr>`),Y=await De()}catch(e){g(`Error cargando reventas: `+e.message,`error`),Y=[]}}function Oi(e){if(!X)return;if(e.length===0){X.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron reventas</td></tr>`;return}let t=JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).rol===`Administrador`;X.innerHTML=e.map(e=>{let n=Number(e.costo||0),r=Number(e.precio||0),i=Number(e.utilidad||r-n),a=e=>new Intl.NumberFormat(`es-CO`).format(e);return`
      <tr class="hover:bg-surface-container-low transition-colors text-sm">
        <td class="px-4 py-3 font-mono font-bold">${e.id||`-`}</td>
        <td class="px-4 py-3 font-bold">${e.producto||`-`}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 bg-surface-container rounded text-[10px] font-medium">${e.categoria||`Otros`}</span></td>
        <td class="px-4 py-3">
          <p class="text-[10px] text-on-surface-variant">C: $${a(n)}</p>
          <p class="font-bold text-primary">V: $${a(r)}</p>
        </td>
        <td class="px-4 py-3 font-bold ${i>=0?`text-green-600`:`text-error`}">$${a(i)}</td>
        <td class="px-4 py-3 text-right">
          ${t?`<button onclick="window.pedDelete('${e.id}')" class="p-1.5 text-on-surface-variant hover:text-error rounded-lg">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>`:``}
        </td>
      </tr>
    `}).join(``)}function ki(){let e=()=>{if(!fi)return;let e=fi.value.toLowerCase().trim(),t=pi?pi.value:``;Oi(Y.filter(n=>{let r=(n.producto||``).toLowerCase().includes(e)||(n.id||``).toLowerCase().includes(e),i=t?n.categoria===t:!0;return r&&i}))};fi?.addEventListener(`input`,e),pi?.addEventListener(`change`,e);let t=e=>{let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))};Ci?.addEventListener(`input`,t),wi?.addEventListener(`input`,t),mi?.addEventListener(`click`,()=>Ai(null)),hi?.addEventListener(`click`,ji),gi?.addEventListener(`click`,ji),vi?.addEventListener(`click`,Mi),window.pedDelete=async e=>{if(confirm(`¿Eliminar la reventa ${e}?`))try{let t=await ke(e);t&&t.success&&(g(`Eliminada`,`success`),await Di(),Oi(Y))}catch(e){g(e.message,`error`)}}}function Ai(e){Z&&(_i?.reset(),e&&(yi&&(yi.value=e.id),bi&&(bi.value=e.producto||``),Ci&&(Ci.value=e.costo||0),wi&&(wi.value=e.precio||0)),Z.classList.remove(`hidden`),Z.classList.add(`flex`))}function ji(){Z?.classList.add(`hidden`),Z?.classList.remove(`flex`)}async function Mi(){if(!di){di=!0;try{(await Oe({producto:bi?.value.trim(),categoria:xi?.value,proveedor:Si?.value.trim(),costo:parseInt(Ci?.value.replace(/\D/g,``))||0,precio:parseInt(wi?.value.replace(/\D/g,``))||0})).success&&(g(`Guardado`,`success`),ji(),await Di(),Oi(Y))}catch(e){g(e.message,`error`)}finally{di=!1}}}var Q=[],Ni=!1,Pi=!1,Fi=null,$={};function Ii(){return async()=>{Ni||=(await Li(),Bi(),!0),Ri(Q)}}async function Li(){let e=document.getElementById(`tech-grid`);try{e&&(e.innerHTML=`<p class="col-span-full text-center p-10 opacity-50 italic">Cargando servicios...</p>`),Q=await Ae()}catch{g(`Error al cargar datos`,`error`),Q=[]}}function Ri(e){let t=document.getElementById(`tech-grid`);if(!t)return;if(e.length===0){t.innerHTML=`<p class="col-span-full text-center p-20 opacity-30 italic text-sm">No hay órdenes de servicio activas</p>`;return}let n=e=>new Intl.NumberFormat(`es-CO`).format(e||0);t.innerHTML=e.map(e=>{let t=(e.precio_final||0)-(e.abono||0);return`
      <div class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">${e.id_orden}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${zi(e.estado)}">${e.estado}</span>
        </div>
        
        <h3 class="font-black text-on-surface text-base mb-1 truncate">${e.equipo}</h3>
        <p class="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">person</span> ${e.cliente}
        </p>

        <div class="bg-surface-container-low rounded-xl p-3 mb-4">
          <p class="text-[10px] uppercase font-bold text-on-surface-variant/60 mb-1">Falla Reportada</p>
          <p class="text-xs text-on-surface italic line-clamp-2">${e.falla}</p>
        </div>
        
        ${e.evidencias&&e.evidencias!==`{}`&&e.evidencias.length>5?`<div class="flex items-center gap-1.5 mb-3 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 w-fit rounded-md"><span class="material-symbols-outlined text-[14px]">photo_camera</span> Evidencias Adjuntas</div>`:``}

        <div class="grid grid-cols-2 gap-2 mb-4 border-t border-surface-variant/30 pt-3">
          <div>
            <p class="text-[9px] uppercase font-bold text-on-surface-variant/50">Total</p>
            <p class="text-sm font-black text-on-surface">$${n(e.precio_final)}</p>
          </div>
          <div class="text-right">
            <p class="text-[9px] uppercase font-bold text-on-surface-variant/50">Saldo</p>
            <p class="text-sm font-black ${t>0?`text-error`:`text-green-600`}">$${n(t)}</p>
          </div>
        </div>

        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onclick="window.techPrint('${e.id_orden}')" title="Imprimir Ticket" class="p-2 bg-surface border border-surface-variant rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors">
            <span class="material-symbols-outlined text-[18px]">print</span>
          </button>
          <button onclick="window.techEdit('${e.id_orden}')" class="flex-1 py-2 bg-surface border border-surface-variant rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">edit</span> Editar
          </button>
          <button onclick="window.techDelete('${e.id_orden}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-error hover:bg-error/5 transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `}).join(``)}function zi(e){return{Ingresado:`bg-slate-100 text-slate-700`,"En Revisión":`bg-blue-100 text-blue-700`,"En Taller":`bg-blue-100 text-blue-700`,Reparado:`bg-green-100 text-green-700`,Entregado:`bg-emerald-600 text-white`,"Sin Arreglo":`bg-red-100 text-red-700`}[e]||`bg-slate-100 text-slate-600`}function Bi(){document.getElementById(`tech-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();Ri(Q.filter(e=>e.cliente.toLowerCase().includes(t)||e.id_orden.toLowerCase().includes(t)||e.equipo.toLowerCase().includes(t)))}),document.getElementById(`tech-new-btn`)?.addEventListener(`click`,()=>Vi()),document.getElementById(`tech-modal-close`)?.addEventListener(`click`,Hi),document.getElementById(`tech-modal-backdrop`)?.addEventListener(`click`,Hi),document.getElementById(`tech-form`)?.addEventListener(`submit`,Ui),[`recepcion`,`resultado`].forEach(e=>{let t=document.getElementById(`tech-preview-${e}-btn`),n=document.getElementById(`tech-img-${e}`),r=document.getElementById(`tech-preview-${e}-wrap`),i=document.getElementById(`tech-preview-${e}`),a=document.getElementById(`tech-remove-${e}`);t?.addEventListener(`click`,()=>n?.click()),n?.addEventListener(`change`,n=>{let a=n.target.files[0];if(!a)return;let o=new FileReader;o.onload=n=>{$[e]={file:a,base64:n.target.result.split(`,`)[1],mime:a.type},i.src=n.target.result,t.classList.add(`hidden`),r.classList.remove(`hidden`)},o.readAsDataURL(a)}),a?.addEventListener(`click`,()=>{n.value=``,delete $[e],i.src=``,r.classList.add(`hidden`),t.classList.remove(`hidden`)})}),window.techEdit=e=>{let t=Q.find(t=>t.id_orden===e);t&&Vi(t)},window.techPrint=e=>{let t=Q.find(t=>t.id_orden===e);if(!t)return;let n=e=>new Intl.NumberFormat(`es-CO`).format(e||0),r=(t.precio_final||0)-(t.abono||0),i=new Date().toLocaleDateString(`es-CO`,{year:`numeric`,month:`2-digit`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`}),a=`
      <html>
      <head>
        <title>Ticket de Servicio - ${t.id_orden}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; width: 300px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .mb-2 { margin-bottom: 10px; }
          .text-lg { font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="center mb-2">
          <h2 style="margin:0;">ADMINPRO</h2>
          <p style="margin:3px 0;">Servicio Técnico</p>
        </div>
        
        <div class="row bold"><span>ORDEN:</span><span>${t.id_orden}</span></div>
        <div class="row"><span>Fecha:</span><span>${i}</span></div>
        <div class="row"><span>Estado:</span><span>${t.estado}</span></div>
        <div class="line"></div>
        
        <div class="mb-2">
          <div class="bold">Cliente:</div>
          <div>${t.cliente}</div>
        </div>
        
        <div class="mb-2">
          <div class="bold">Equipo:</div>
          <div>${t.equipo}</div>
        </div>
        
        <div class="mb-2">
          <div class="bold">Falla Reportada:</div>
          <div>${t.falla}</div>
        </div>
        
        <div class="line"></div>
        
        <div class="row"><span>Costo Total:</span><span>$${n(t.precio_final)}</span></div>
        <div class="row"><span>Abono:</span><span>$${n(t.abono)}</span></div>
        <div class="row bold text-lg" style="margin-top: 5px;"><span>SALDO:</span><span>$${n(r)}</span></div>
        
        <div class="line"></div>
        <div class="center" style="margin-top: 20px; font-size: 10px;">
          <p>Conserve este ticket para retirar su equipo.</p>
          <p>¡Gracias por preferirnos!</p>
        </div>
      </body>
      </html>
    `,o=window.open(``,``,`width=400,height=600`);o?(o.document.open(),o.document.write(a),o.document.close(),o.focus(),setTimeout(()=>{o.print(),o.close()},250)):g(`Por favor permite las ventanas emergentes para imprimir`,`warning`)},window.techDelete=async e=>{if(confirm(`¿Eliminar orden ${e}?`))try{(await Ne(e)).success&&(g(`Orden eliminada`,`success`),await Li(),Ri(Q))}catch(e){g(e.message,`error`)}}}function Vi(e=null){if(Fi=e?e.id_orden:null,document.getElementById(`tech-form`).reset(),document.getElementById(`tech-modal-title`).textContent=e?`Editar Orden`:`Ingreso a Servicio Técnico`,$={},[`recepcion`,`resultado`].forEach(e=>{document.getElementById(`tech-preview-${e}-btn`)?.classList.remove(`hidden`),document.getElementById(`tech-preview-${e}-wrap`)?.classList.add(`hidden`),document.getElementById(`tech-preview-${e}`).src=``}),e&&(document.getElementById(`tech-cliente`).value=e.cliente,document.getElementById(`tech-equipo`).value=e.equipo,document.getElementById(`tech-falla`).value=e.falla,document.getElementById(`tech-costo`).value=new Intl.NumberFormat(`es-CO`).format(e.precio_final||0),document.getElementById(`tech-estado`).value=e.estado,e.evidencias))try{let t=JSON.parse(e.evidencias);[`recepcion`,`resultado`].forEach(e=>{t[e]&&(document.getElementById(`tech-preview-${e}`).src=t[e],document.getElementById(`tech-preview-${e}-btn`).classList.add(`hidden`),document.getElementById(`tech-preview-${e}-wrap`).classList.remove(`hidden`),$[e]={url:t[e]})})}catch{}let t=document.getElementById(`tech-modal`);t.classList.remove(`hidden`),t.classList.add(`flex`)}function Hi(){let e=document.getElementById(`tech-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)}async function Ui(e){if(e.preventDefault(),Pi)return;Pi=!0;let t=document.getElementById(`tech-save-btn`);t.disabled=!0;let n=Fi||`ST-${Date.now().toString().slice(-6)}`;t.innerHTML=`<span class="material-symbols-outlined animate-spin">progress_activity</span> Subiendo...`;let r={};for(let e of[`recepcion`,`resultado`])if($[e])if($[e].base64)try{let t=await re($[e].base64,`${n}_${e}`,$[e].mime);t&&(r[e]=t)}catch(e){console.error(`Error upload evidencia`,e)}else $[e].url&&(r[e]=$[e].url);let i=[n,document.getElementById(`tech-cliente`).value.trim(),`310`,document.getElementById(`tech-equipo`).value.trim(),`S/N`,document.getElementById(`tech-falla`).value.trim(),`0000`,``,0,0,parseInt(document.getElementById(`tech-costo`).value.replace(/\D/g,``))||0,document.getElementById(`tech-estado`).value,JSON.stringify(r)];try{(Fi?await Me(Fi,i):await je(i)).success&&(g(Fi?`Actualizado`:`Ingresado`,`success`),Hi(),await Li(),Ri(Q))}catch(e){g(e.message,`error`)}finally{Pi=!1,t.disabled=!1,t.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`}}var Wi=[],Gi=!1,Ki=!1,qi,Ji,Yi,Xi,Zi,Qi,$i,ea,ta,na,ra,ia,aa;function oa(){return async()=>{sa(),Gi||=(await ca(),ua(),!0),la(Wi)}}function sa(){qi=document.getElementById(`exp-table-body`),Ji=document.getElementById(`exp-search`),Yi=document.getElementById(`exp-filter-cat`),Xi=document.getElementById(`exp-new-btn`),Zi=document.getElementById(`exp-modal`),Qi=document.getElementById(`exp-modal-close`),$i=document.getElementById(`exp-modal-backdrop`),ea=document.getElementById(`exp-form`),ta=document.getElementById(`exp-save-btn`),na=document.getElementById(`exp-monto`),ra=document.getElementById(`exp-categoria`),ia=document.getElementById(`exp-concepto`),aa=document.getElementById(`exp-responsable`)}async function ca(){try{qi.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando egresos...</td></tr>`,Wi=await Fe()}catch(e){g(`Error cargando egresos: `+e.message,`error`),Wi=[]}}function la(e){if(e.length===0){qi.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron egresos</td></tr>`;return}qi.innerHTML=e.map(e=>`
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-4 py-3">
          <div class="font-mono text-xs font-bold text-on-surface">${e.id||`-`}</div>
          <div class="text-[10px] text-on-surface-variant">${e.fecha||``}</div>
        </td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-surface-container-high text-on-surface">
            ${e.categoria||`Otro`}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-on-surface-variant max-w-[200px] truncate" title="${e.concepto}">
          ${e.concepto||`-`}
        </td>
        <td class="px-4 py-3 text-sm text-on-surface-variant">${e.responsable||`-`}</td>
        <td class="px-4 py-3 text-sm font-black text-error">-$${new Intl.NumberFormat(`es-CO`).format(e.monto||0)}</td>
        <td class="px-4 py-3 text-right">
          <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-50 cursor-not-allowed" title="No se pueden editar egresos por seguridad">
            <span class="material-symbols-outlined text-[18px]">lock</span>
          </button>
        </td>
      </tr>
    `).join(``)}function ua(){let e=()=>{let e=Ji.value.toLowerCase().trim(),t=Yi.value;la(Wi.filter(n=>{let r=(n.concepto||``).toLowerCase().includes(e)||(n.responsable||``).toLowerCase().includes(e)||(n.id||``).toLowerCase().includes(e),i=t?n.categoria===t:!0;return r&&i}))};Ji.addEventListener(`input`,e),Yi.addEventListener(`change`,e),na.addEventListener(`input`,e=>{let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))}),Xi.addEventListener(`click`,()=>da()),Qi.addEventListener(`click`,fa),$i.addEventListener(`click`,fa),ta.addEventListener(`click`,pa)}function da(){ea.reset();try{let e=localStorage.getItem(`adminpro_user`);if(e){let t=JSON.parse(e);aa.value=t.nombre||t.email}}catch{aa.value=`Sistema`}Zi.classList.remove(`hidden`),Zi.classList.add(`flex`),na.focus()}function fa(){Zi.classList.add(`hidden`),Zi.classList.remove(`flex`)}async function pa(){if(!ea.checkValidity()){ea.reportValidity();return}if(!Ki){Ki=!0,ta.textContent=`Registrando...`,ta.disabled=!0;try{let e=await Ie({monto:parseInt(na.value.replace(/\D/g,``))||0,categoria:ra.value,concepto:ia.value.trim(),responsable:aa.value});e&&e.success?(g(`Egreso registrado`,`success`),fa(),await ca(),la(Wi)):g(e?.mensaje||`Error al registrar`,`error`)}catch(e){g(`Error de conexión: `+e.message,`error`)}finally{Ki=!1,ta.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`,ta.disabled=!1}}}var ma=[],ha=[];function ga(){return async()=>{await _a(),Sa()}}async function _a(){try{let e=document.getElementById(`nom-list`);e&&(e.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-sm text-on-surface-variant">Cargando nóminas...</td></tr>`),[ma,ha]=await Promise.all([Le(),oe()]),va(ma),ya(ma)}catch{g(`Error al cargar nóminas`,`error`)}}function va(e){let t=document.getElementById(`nom-list`);if(t){if(!e||e.length===0){t.innerHTML=`
      <tr>
        <td colspan="6" class="p-8 text-center text-on-surface-variant">
          <span class="material-symbols-outlined text-4xl mb-2 opacity-50" style="font-variation-settings:'FILL' 1">request_quote</span>
          <p class="text-sm font-medium">No hay nóminas registradas</p>
        </td>
      </tr>
    `;return}t.innerHTML=e.map(e=>{let t=new Date(e.fecha).toLocaleDateString(`es-CO`,{year:`numeric`,month:`short`,day:`numeric`}),n=parseFloat(e.total_pagar)||0,r=`bg-amber-100 text-amber-800`;return e.estado===`Pagado`?r=`bg-green-100 text-green-800`:e.estado===`Anulado`&&(r=`bg-red-100 text-red-800`),`
      <tr class="hover:bg-surface-container-lowest transition-colors group">
        <td class="px-4 py-3 border-b border-surface-variant whitespace-nowrap">
          <p class="text-sm font-medium text-on-surface">${t}</p>
          <p class="text-[11px] text-on-surface-variant font-mono mt-0.5">${e.id_nomina}</p>
        </td>
        <td class="px-4 py-3 border-b border-surface-variant">
          <p class="text-sm font-bold text-on-surface">${e.empleado}</p>
          <p class="text-[11px] text-on-surface-variant">${e.periodo}</p>
        </td>
        <td class="px-4 py-3 border-b border-surface-variant text-right">
          <p class="text-sm font-medium text-on-surface">$${parseFloat(e.salario_base).toLocaleString(`es-CO`)}</p>
          ${parseFloat(e.bonificaciones)>0?`<p class="text-[11px] text-green-600">+ $${parseFloat(e.bonificaciones).toLocaleString()}</p>`:``}
          ${parseFloat(e.deducciones)>0?`<p class="text-[11px] text-red-600">- $${parseFloat(e.deducciones).toLocaleString()}</p>`:``}
        </td>
        <td class="px-4 py-3 border-b border-surface-variant text-right">
          <span class="text-sm font-black text-primary">$${n.toLocaleString(`es-CO`)}</span>
        </td>
        <td class="px-4 py-3 border-b border-surface-variant text-center">
          <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${r}">${e.estado}</span>
        </td>
        <td class="px-4 py-3 border-b border-surface-variant text-right">
          <button class="nom-del-btn p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors opacity-0 group-hover:opacity-100" data-id="${e.id_nomina}" title="Eliminar">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </td>
      </tr>
    `}).join(``),document.querySelectorAll(`.nom-del-btn`).forEach(e=>{e.addEventListener(`click`,async e=>{let t=e.currentTarget.dataset.id;if(confirm(`¿Estás seguro de eliminar este registro de nómina?`))try{await ze(t),g(`Nómina eliminada`,`success`),_a()}catch{g(`Error al eliminar`,`error`)}})})}}function ya(e){let t=new Date,n=t.getMonth(),r=t.getFullYear(),i=0,a=0;e.forEach(e=>{let t=new Date(e.fecha);t.getMonth()===n&&t.getFullYear()===r&&e.estado!==`Anulado`&&(i+=parseFloat(e.total_pagar)||0),e.estado===`Pendiente`&&(a+=parseFloat(e.total_pagar)||0)});let o=document.getElementById(`nom-stat-mes`),s=document.getElementById(`nom-stat-pendiente`);o&&(o.textContent=`$`+i.toLocaleString(`es-CO`)),s&&(s.textContent=`$`+a.toLocaleString(`es-CO`))}function ba(){let e=parseFloat(document.getElementById(`nom-base`).value)||0,t=parseFloat(document.getElementById(`nom-bonos`).value)||0,n=parseFloat(document.getElementById(`nom-deduc`).value)||0,r=e+t-n;document.getElementById(`nom-total-calc`).textContent=`$`+r.toLocaleString(`es-CO`)}var xa=!1;function Sa(){if(xa)return;xa=!0;let e=document.getElementById(`nom-modal`),t=document.getElementById(`nom-form`);document.getElementById(`nom-new-btn`)?.addEventListener(`click`,()=>{t.reset();let n=document.getElementById(`nom-empleado`);n&&(n.innerHTML=`<option value="">Seleccione empleado...</option>`+ha.map(e=>`<option value="${e.nombre}">${e.nombre} (${e.rol})</option>`).join(``)),ba(),e.classList.remove(`hidden`),e.classList.add(`flex`)}),document.getElementById(`nom-modal-close`)?.addEventListener(`click`,()=>{e.classList.add(`hidden`),e.classList.remove(`flex`)}),document.getElementById(`nom-modal-cancel`)?.addEventListener(`click`,()=>{e.classList.add(`hidden`),e.classList.remove(`flex`)}),document.getElementById(`nom-base`)?.addEventListener(`input`,ba),document.getElementById(`nom-bonos`)?.addEventListener(`input`,ba),document.getElementById(`nom-deduc`)?.addEventListener(`input`,ba),document.getElementById(`nom-save-btn`)?.addEventListener(`click`,async()=>{if(!t.checkValidity()){t.reportValidity();return}let n=parseFloat(document.getElementById(`nom-base`).value)||0,r=parseFloat(document.getElementById(`nom-bonos`).value)||0,i=parseFloat(document.getElementById(`nom-deduc`).value)||0,a=n+r-i,o={empleado:document.getElementById(`nom-empleado`).value,periodo:document.getElementById(`nom-periodo`).value,salario_base:n,bonificaciones:r,deducciones:i,total_pagar:a,estado:document.getElementById(`nom-estado`).value,notas:document.getElementById(`nom-notas`).value},s=document.getElementById(`nom-save-btn`);s.disabled=!0,s.innerHTML=`<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Guardando...`;try{await Re(o),g(`Nómina registrada exitosamente`,`success`),e.classList.add(`hidden`),e.classList.remove(`flex`),_a()}catch(e){g(`Error al guardar: `+e.message,`error`)}finally{s.disabled=!1,s.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`}})}function Ca(){return()=>{wa(),Ta()}}function wa(){let e=document.getElementById(`set-avatar`),t=document.getElementById(`set-name`),n=document.getElementById(`set-role`),r=document.getElementById(`set-email`);try{let i=localStorage.getItem(`adminproSession`),a=localStorage.getItem(`adminpro_user`),o=i?JSON.parse(i):a?JSON.parse(a):null;o?(t&&(t.textContent=o.nombre||`Usuario`),n&&(n.textContent=o.rol||`Administrador`),r&&(r.textContent=o.email||`No disponible`),e&&(e.textContent=(o.nombre?o.nombre.charAt(0):`U`).toUpperCase())):console.warn(`No se encontró sesión activa para cargar el perfil.`)}catch(e){console.error(`Error loading profile`,e)}let i=document.getElementById(`set-theme-toggle`);i&&(i.checked=document.documentElement.classList.contains(`dark`))}function Ta(){let e=document.getElementById(`set-logout-btn`);e?.replaceWith(e.cloneNode(!0)),document.getElementById(`set-logout-btn`)?.addEventListener(`click`,()=>{confirm(`¿Estás seguro de que deseas cerrar sesión?`)&&p()});let t=document.getElementById(`set-theme-toggle`);t?.replaceWith(t.cloneNode(!0)),document.getElementById(`set-theme-toggle`)?.addEventListener(`change`,e=>{e.target.checked?(document.documentElement.classList.add(`dark`),localStorage.setItem(`adminpro_theme`,`dark`)):(document.documentElement.classList.remove(`dark`),localStorage.setItem(`adminpro_theme`,`light`))})}`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/adminpro/sw.js`,{scope:`/adminpro/`}).catch(e=>{console.log(`ServiceWorker registration failed: `,e)})});var Ea=``,Da=``,Oa=null;document.addEventListener(`keydown`,e=>{if(!(e.ctrlKey||e.altKey||e.metaKey))if(e.key===`Enter`){if(Da.length>=3){let t=Da;Da=``,clearTimeout(Oa),document.dispatchEvent(new CustomEvent(`barcodeScanned`,{detail:t})),(document.activeElement?document.activeElement.tagName:``)!==`TEXTAREA`&&e.preventDefault();return}Da=``}else e.key.length===1&&(Da+=e.key,clearTimeout(Oa),Oa=setTimeout(()=>{Da=``},50))});function ka(){try{let e=JSON.parse(localStorage.getItem(`adminproSession`)||`null`);return e&&Date.now()<e.expiresAt?e:null}catch{return null}}function Aa(e,t){d(t),localStorage.setItem(`adminproSession`,JSON.stringify({...e,token:t,expiresAt:Date.now()+480*60*1e3}))}function ja(){d(null),localStorage.removeItem(`adminproSession`),localStorage.removeItem(`adminpro_user`)}var Ma=[{label:`Inicio`,items:[{id:`dashboard`,label:`Dashboard`,icon:`dashboard`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]}]},{label:`Operaciones`,items:[{id:`pos`,label:`Ventas (POS)`,icon:`point_of_sale`,roles:[`Administrador`,`Vendedor`]},{id:`sales-history`,label:`Historial de Ventas`,icon:`history`,roles:[`Administrador`,`Vendedor`]},{id:`credits`,label:`Créditos`,icon:`credit_score`,roles:[`Administrador`,`Vendedor`]},{id:`expenses`,label:`Egresos`,icon:`payments`,roles:[`Administrador`]},{id:`nominas`,label:`Nóminas`,icon:`request_quote`,roles:[`Administrador`]}]},{label:`Inventario`,items:[{id:`inventory`,label:`Catálogo General`,icon:`inventory_2`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]},{id:`imei`,label:`Equipos IMEI`,icon:`phone_android`,roles:[`Administrador`,`Vendedor`]},{id:`reventas`,label:`Reventas`,icon:`storefront`,roles:[`Administrador`,`Vendedor`]}]},{label:`Servicios`,items:[{id:`technical`,label:`Servicio Técnico`,icon:`build`,roles:[`Administrador`,`Técnico de reparación`]}]},{label:`Organización`,items:[{id:`tasks`,label:`Lista de Tareas`,icon:`check_circle`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]},{id:`calendar`,label:`Actividad`,icon:`history_toggle_off`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]}]},{label:`Personas`,items:[{id:`clients`,label:`Clientes`,icon:`people`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]},{id:`users`,label:`Equipo / Usuarios`,icon:`manage_accounts`,roles:[`Administrador`]}]},{label:`Otros`,items:[{id:`settings`,label:`Ajustes`,icon:`settings`,roles:[`Administrador`,`Vendedor`,`Técnico de reparación`]}]}];function Na(e){let t=document.getElementById(`mobile-drawer`),n=document.getElementById(`mobile-drawer-backdrop`),r=document.getElementById(`mobile-drawer-content`);e?(t.classList.remove(`hidden`),setTimeout(()=>{n.classList.replace(`opacity-0`,`opacity-100`),r.classList.replace(`translate-y-full`,`translate-y-0`)},10)):(n.classList.replace(`opacity-100`,`opacity-0`),r.classList.replace(`translate-y-0`,`translate-y-full`),setTimeout(()=>t.classList.add(`hidden`),300))}function Pa(e,t,n=!1){let r=document.getElementById(e);if(!r)return;let i=t||`Vendedor`,a=``;if(n){let e=[];e=i===`Técnico de reparación`?[{id:`dashboard`,label:`Home`,icon:`dashboard`},{id:`technical`,label:`Reparar`,icon:`build`},{id:`inventory`,label:`Stock`,icon:`inventory_2`},{id:`tasks`,label:`Tareas`,icon:`check_circle`}]:[{id:`dashboard`,label:`Home`,icon:`dashboard`},{id:`pos`,label:`Venta`,icon:`point_of_sale`},{id:`inventory`,label:`Stock`,icon:`inventory_2`},{id:`tasks`,label:`Tareas`,icon:`check_circle`}],a=e.map(e=>`
      <button data-nav="${e.id}" class="nav-btn flex flex-col items-center justify-center gap-0.5 py-2 w-full text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[24px]">${e.icon}</span>
        <span class="text-[10px] font-bold tracking-tight">${e.label}</span>
      </button>
    `).join(``),a+=`
      <button id="mobile-more-btn" class="flex flex-col items-center justify-center gap-0.5 py-2 w-full text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[24px]">apps</span>
        <span class="text-[10px] font-bold tracking-tight">Más</span>
      </button>
    `;let t=document.getElementById(`mobile-drawer-grid`);t&&(t.innerHTML=Ma.flatMap(e=>e.items).filter(e=>!e.roles||e.roles.includes(i)).map(e=>`
        <button data-nav="${e.id}" class="flex flex-col items-center gap-2 p-4 bg-surface-container rounded-2xl active:scale-95 transition-all">
          <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-primary text-[24px]">${e.icon}</span>
          </div>
          <span class="text-[11px] font-bold text-on-surface text-center leading-tight">${e.label}</span>
        </button>
      `).join(``))}else Ma.forEach(e=>{let t=e.items.filter(e=>!e.roles||e.roles.includes(i));t.length!==0&&(a+=`<p class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mt-6 mb-2 px-4 italic">${e.label}</p>`,t.forEach(e=>{a+=`
          <button data-nav="${e.id}" class="nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-left text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150 text-sm font-medium mb-0.5 group">
            <span class="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">${e.icon}</span>
            <span>${e.label}</span>
          </button>
        `}))});r.innerHTML=a,n&&(document.getElementById(`mobile-more-btn`)?.addEventListener(`click`,()=>Na(!0)),document.getElementById(`mobile-drawer-close`)?.addEventListener(`click`,()=>Na(!1)),document.getElementById(`mobile-drawer-backdrop`)?.addEventListener(`click`,()=>Na(!1)),document.querySelectorAll(`#mobile-drawer-grid [data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>{Na(!1),o(e.dataset.nav)})})),r.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>o(e.dataset.nav))})}function Fa(e){document.querySelectorAll(`#desktop-nav [data-nav]`).forEach(t=>{let n=t.dataset.nav===e;t.classList.toggle(`bg-primary`,n),t.classList.toggle(`text-white`,n),t.classList.toggle(`shadow-lg`,n),t.classList.toggle(`text-slate-400`,!n)}),document.querySelectorAll(`#mobile-nav [data-nav]`).forEach(t=>{let n=t.dataset.nav===e;t.classList.toggle(`text-primary`,n),t.classList.toggle(`text-on-surface-variant`,!n)});let t=`AdminPro`;Ma.forEach(n=>{let r=n.items.find(t=>t.id===e);r&&(t=r.label)});let n=document.getElementById(`header-title`);n&&(n.textContent=t)}function Ia(e,t){document.getElementById(`login-screen`).classList.add(`hidden`),document.getElementById(`app-shell`).classList.remove(`hidden`);let n=document.getElementById(`user-name`);n&&(n.textContent=e||`Usuario`),Pa(`desktop-nav`,t,!1),Pa(`mobile-nav`,t,!0);let s=t||`Vendedor`;a(e=>{let t=!1,n=!1;if(Ma.forEach(r=>{let i=r.items.find(t=>t.id===e);i&&(n=!0,(!i.roles||i.roles.includes(s))&&(t=!0))}),n&&!t)return g(`No tienes permiso para acceder a este módulo`,`warning`),`dashboard`}),document.querySelectorAll(`[data-goto]`).forEach(e=>{let t=e.dataset.goto,n=!1;Ma.forEach(e=>{let r=e.items.find(e=>e.id===t);r&&(!r.roles||r.roles.includes(s))&&(n=!0)}),n?e.classList.remove(`hidden`):e.classList.add(`hidden`)}),i(Fa),r(`inventory`,At()),r(`dashboard`,Mt()),r(`pos`,yn()),r(`imei`,Gn()),r(`clients`,hr()),r(`credits`,Tr()),r(`sales-history`,Fr()),r(`tasks`,Br()),r(`calendar`,Zr()),r(`users`,ri()),r(`reventas`,Ti()),r(`technical`,Ii()),r(`expenses`,oa()),r(`nominas`,ga()),r(`settings`,Ca()),o(`dashboard`)}function La(e){let t=document.getElementById(`step-credentials`),n=document.getElementById(`step-pin`);t&&t.classList.toggle(`hidden`,e!==`credentials`),n&&n.classList.toggle(`hidden`,e!==`pin`)}function Ra(){document.getElementById(`app-shell`).classList.add(`hidden`),document.getElementById(`login-screen`).classList.remove(`hidden`),La(`credentials`)}async function za(){await p(),ja(),Ra()}window.addEventListener(`session-expired`,()=>{ja(),Ra()}),document.getElementById(`login-form`)?.addEventListener(`submit`,Ba),document.getElementById(`pin-form`)?.addEventListener(`submit`,Va),document.getElementById(`back-to-login`)?.addEventListener(`click`,()=>La(`credentials`)),document.getElementById(`logout-btn`)?.addEventListener(`click`,za);async function Ba(e){e.preventDefault();let t=document.getElementById(`login-btn`),n=document.getElementById(`login-email`).value.trim(),r=document.getElementById(`login-pwd`).value.trim();t.disabled=!0,t.textContent=`Verificando...`;try{let e=await ie(n,r);e.success&&e.step===`pin`?(Ea=n,document.getElementById(`pin-hint`).textContent=`Enviamos un PIN a ${n}`,La(`pin`),document.getElementById(`login-pin`).focus()):g(e.mensaje||`Credenciales incorrectas`,`error`)}catch{g(`Error de conexión`,`error`)}finally{t.disabled=!1,t.textContent=`Ingresar`}}async function Va(e){e.preventDefault();let t=document.getElementById(`pin-btn`),n=document.getElementById(`login-pin`).value.trim();t.disabled=!0,t.textContent=`Verificando...`;try{let e=await ae(Ea,n);e.success&&e.token?(Aa({email:e.email,nombre:e.nombre,rol:e.rol},e.token),Ia(e.nombre,e.rol)):g(e.mensaje||`PIN incorrecto`,`error`)}catch{g(`Error`,`error`)}finally{t.disabled=!1,t.textContent=`Verificar`}}var Ha=ka();Ha&&Ha.token&&f()?(d(Ha.token),Ia(Ha.nombre,Ha.rol)):(ja(),Ra());