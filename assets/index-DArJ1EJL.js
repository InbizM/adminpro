(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://adminpro-adminpro.aws-us-west-2.turso.io/v2/pipeline`,t=`eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzcyOTIwOTMsImlkIjoiMDE5ZGNlZGItOTIwMS03NGVkLWIwZGYtZjg4MTQ3NjlhODcxIiwicmlkIjoiNWIwMWViNTctYTgxYS00OTI0LWIzMDUtZjk1Y2EwMjUzNmRkIn0.oruUZmv_ZLWlKA2ctQnghAD5PIiJSIeR4nzbZia-q-f1r12IHhLv1hDw9CsReABIceaVRHPS52JMZ4j3lcZ1Bw`,n=`https://script.google.com/macros/s/AKfycbxxs-PUyNqqALN2-azEHaViv5PM1r5oteanvr2Sfydic-bBQJrGWj00R0FO7UAlP4Ug/exec`,r=localStorage.getItem(`adminpro_gas_token`)||``,i=e=>{r=e,localStorage.setItem(`adminpro_gas_token`,e)},a=()=>r,o=()=>{localStorage.clear(),location.reload()};async function s(n){let r=Array.isArray(n)?n.map(e=>typeof e==`string`?{type:`execute`,stmt:{sql:e}}:e):[{type:`execute`,stmt:typeof n==`string`?{sql:n}:n}],i=await(await fetch(e,{method:`POST`,headers:{Authorization:`Bearer ${t}`,"Content-Type":`application/json`},body:JSON.stringify({requests:r})})).json();if(i.error)throw Error(i.error.message);return(i.results||[]).map(e=>{if(!e.response||!e.response.result)return[];let{cols:t,rows:n}=e.response.result;return n.map(e=>{let n={};return t.forEach((t,r)=>{n[t.name]=e[r].value}),n})})}var c=e=>e.map(e=>({type:typeof e==`number`?`float`:`text`,value:String(e)})),l=async(e,t)=>{let r=await s({sql:`SELECT * FROM usuarios WHERE email = ? AND password = ? AND estado = 'Activo'`,args:[{type:`text`,value:e.toLowerCase()},{type:`text`,value:t}]});return!r[0]||r[0].length===0?{success:!1,mensaje:`Credenciales incorrectas`}:await(await fetch(`${n}?action=login&email=${encodeURIComponent(e)}&password=${t}`)).json()},u=async(e,t)=>{let r=await(await fetch(`${n}?action=verifyPin&email=${encodeURIComponent(e)}&pin=${t}`)).json();if(r.success){i(r.token);let t={...(await s({sql:`SELECT nombre, rol, email FROM usuarios WHERE email = ?`,args:[{type:`text`,value:e.toLowerCase()}]}))[0]?.[0]||{nombre:`Usuario`},token:r.token};return localStorage.setItem(`adminpro_user`,JSON.stringify(t)),{success:!0,...t}}return r},d=async()=>(await s(`SELECT * FROM clientes`))[0]||[],ee=e=>s({sql:`INSERT INTO clientes VALUES (?,?,?,?,?,?,?)`,args:c(e)}),te=async()=>(await s(`SELECT * FROM ventas ORDER BY fecha DESC`))[0]||[],ne=async()=>(await s(`SELECT * FROM creditos`))[0].map(e=>({...e,id:e.id_credito,idFactura:e.id_factura_ref,abonado:e.total_abonado,saldo:e.saldo_pendiente,total:e.valor_total})),re=e=>s({sql:`INSERT INTO creditos (id_credito, cliente, telefono, id_factura_ref, fecha_deuda, tipo, valor_total, total_abonado, saldo_pendiente, estado, detalle) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,args:c([Date.now().toString(),e.cliente,e.telefono,e.idFactura,new Date().toISOString(),e.tipo||`Crédito`,e.total,0,e.total,`Activo`,e.detalle])}),ie=(e,t)=>s({sql:`UPDATE creditos SET id_credito=?, cliente=?, telefono=?, id_factura_ref=?, fecha_deuda=?, tipo=?, valor_total=?, total_abonado=?, saldo_pendiente=?, estado=?, fecha_cancelacion=?, detalle=?, historial_abonos=? WHERE id_credito=?`,args:[...c(t),{type:`text`,value:e}]}),ae=async()=>(await s(`SELECT * FROM reventas ORDER BY fecha DESC`))[0].map(e=>({...e,id:e.id_reventa,producto:e.producto,costo:e.costo_proveedor,precio:e.precio_venta,utilidad:e.utilidad})),oe=e=>s({sql:`INSERT INTO reventas VALUES (?,?,?,?,?,?,?,?)`,args:c([`REV-${Date.now()}`,new Date().toISOString(),e.producto,e.categoria,e.costo,e.precio,e.proveedor,e.precio-e.costo])}),se=e=>s({sql:`DELETE FROM reventas WHERE id_reventa = ?`,args:[{type:`text`,value:e}]}),ce=async()=>(await s(`SELECT * FROM servicio_tecnico ORDER BY id_orden DESC`))[0]||[],le=e=>s({sql:`INSERT INTO servicio_tecnico VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,args:c(e)}),ue=(e,t)=>s({sql:`UPDATE servicio_tecnico SET id_orden=?, cliente=?, telefono=?, equipo=?, imei_serie=?, falla=?, clave_patron=?, repuestos=?, costo_taller=?, abono=?, precio_final=?, estado=?, evidencias=? WHERE id_orden=?`,args:[...c(t),{type:`text`,value:e}]}),de=e=>s({sql:`DELETE FROM servicio_tecnico WHERE id_orden = ?`,args:[{type:`text`,value:e}]}),fe=async()=>(await s(`SELECT * FROM egresos`))[0]||[],pe=e=>s({sql:`INSERT INTO egresos VALUES (?,?,?,?,?,?,?)`,args:c([`EGR-${Date.now()}`,new Date().toISOString(),e.categoria,e.concepto,e.responsable,e.monto,``])}),me=async()=>(await s(`SELECT * FROM usuarios`))[0]||[],he=e=>s({sql:`INSERT INTO usuarios VALUES (?,?,?,?,?)`,args:e.map(e=>({type:`text`,value:String(e)}))}),ge=(e,t)=>s({sql:`UPDATE usuarios SET email=?, password=?, nombre=?, rol=?, estado=? WHERE email=?`,args:[...t.map(e=>({type:`text`,value:String(e)})),{type:`text`,value:e}]}),_e=e=>s({sql:`DELETE FROM usuarios WHERE email = ?`,args:[{type:`text`,value:e}]}),ve=async()=>(await s(`SELECT * FROM tareas ORDER BY date(fecha_vencimiento) ASC`))[0]||[],ye=e=>s({sql:`INSERT INTO tareas VALUES (?,?,?,?,?,?,?,?,?)`,args:c([`T-${Date.now()}`,e.tarea,e.fecha_inicio,e.fecha_vencimiento,e.prioridad,e.estado||`Pendiente`,e.responsable,e.notas||``,e.color||`#4f46e5`])}),be=(e,t)=>s({sql:`UPDATE tareas SET estado = ? WHERE id = ?`,args:[{type:`text`,value:t},{type:`text`,value:e}]}),xe=e=>s({sql:`DELETE FROM tareas WHERE id = ?`,args:[{type:`text`,value:e}]});function f(e,t=`success`){let n={success:`bg-green-600`,error:`bg-error`,info:`bg-tertiary`,warning:`bg-amber-500`},r={success:`check_circle`,error:`error`,info:`info`,warning:`warning`},i=document.createElement(`div`);i.className=`fixed bottom-4 right-4 z-[9999] toast-animate`,i.innerHTML=`
    <div class="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl ${n[t]||n.success} min-w-[280px] max-w-sm">
      <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">${r[t]||r.success}</span>
      <span class="flex-1 text-sm font-semibold leading-tight">${e}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="opacity-60 hover:opacity-100 transition-opacity ml-2">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  `,document.body.appendChild(i),setTimeout(()=>i.remove(),4500)}var p=[],Se=!1,m=null,h,Ce,we,g,Te,_,v;async function Ee(){if(De(),!Se)try{p=await d(),Se=!0}catch(e){console.error(`Error loading clients for selector`,e)}}function De(){document.getElementById(`customer-selector-modal`)||(document.body.insertAdjacentHTML(`beforeend`,`
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
  `),h=document.getElementById(`customer-selector-modal`),Ce=document.getElementById(`cs-backdrop`),we=document.getElementById(`cs-close`),g=document.getElementById(`cs-search`),Te=document.getElementById(`cs-new-btn`),_=document.getElementById(`cs-results`),v=document.getElementById(`cs-new-form-area`),we.addEventListener(`click`,Me),Ce.addEventListener(`click`,Me),g.addEventListener(`input`,Oe),Te.addEventListener(`click`,()=>{v.classList.toggle(`hidden`),document.getElementById(`cs-new-doc`).focus()}),document.getElementById(`cs-cancel-new`).addEventListener(`click`,()=>{v.classList.add(`hidden`)}),document.getElementById(`cs-save-new`).addEventListener(`click`,async()=>{let e=document.getElementById(`cs-new-doc`).value.trim(),t=document.getElementById(`cs-new-nom`).value.trim(),n=document.getElementById(`cs-new-tel`).value.trim(),r=document.getElementById(`cs-new-email`).value.trim(),i=document.getElementById(`cs-new-dir`).value.trim(),a=document.getElementById(`cs-new-tipo`).value;if(!e||!t){f(`Documento y Nombre son obligatorios`,`warning`);return}let o=document.getElementById(`cs-save-new`);o.disabled=!0,o.textContent=`...`;try{let o=await ee({documento:e,cedula:e,nombre:t,telefono:n,direccion:i,email:r,tipo:a});if(o&&o.success){f(`Cliente creado`,`success`);let o={cedula:e,documento:e,nombre:t,telefono:n,direccion:i,email:r,tipo:a,id:e};p.push(o),v.classList.add(`hidden`),document.getElementById(`cs-new-doc`).value=``,document.getElementById(`cs-new-nom`).value=``,document.getElementById(`cs-new-tel`).value=``,document.getElementById(`cs-new-email`).value=``,document.getElementById(`cs-new-dir`).value=``,document.getElementById(`cs-new-tipo`).value=`General`,Ae(o)}else f(o.mensaje||`Error al crear`,`error`)}catch{f(`Error de conexión`,`error`)}finally{o.disabled=!1,o.textContent=`Guardar`}}))}function Oe(){let e=g.value.toLowerCase().trim();if(!e){_.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">Escribe para buscar...</li>`;return}ke(p.filter(t=>(t.cedula||t.documento||``).toLowerCase().includes(e)||t.nombre&&t.nombre.toLowerCase().includes(e)||t.telefono&&t.telefono.toLowerCase().includes(e)).slice(0,20))}function ke(e){if(e.length===0){_.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">No se encontraron clientes.</li>`;return}_.innerHTML=e.map(e=>{let t=e.cedula||e.documento||``;return`
    <li>
      <button type="button" class="cs-item-btn w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex flex-col focus:bg-surface-container-low outline-none" data-doc="${t}">
        <span class="font-bold text-sm text-on-surface">${e.nombre}</span>
        <span class="text-[11px] text-on-surface-variant mt-0.5">C.C: ${t} ${e.telefono?`• Tel: `+e.telefono:``}</span>
      </button>
    </li>
  `}).join(``),document.querySelectorAll(`.cs-item-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.doc,n=p.find(e=>(e.cedula||e.documento||``)===t);n&&(n.documento=t,Ae(n))})})}function Ae(e){m&&m(e),Me()}async function je(e){await Ee(),m=e,g.value=``,p.length>0?ke([...p].reverse().slice(0,20)):_.innerHTML=`<li class="p-4 text-center text-sm text-on-surface-variant">No hay clientes. Crea uno nuevo.</li>`,v.classList.add(`hidden`),h.classList.remove(`hidden`),h.classList.add(`flex`),setTimeout(()=>g.focus(),100)}function Me(){h.classList.add(`hidden`),h.classList.remove(`flex`),m=null}var y=[],b=!1,Ne=!1;function Pe(){return async()=>{b||=(await Fe(),Be(),!0),S(y)}}async function Fe(){let e=document.getElementById(`cred-table-body`);e&&(e.innerHTML=`<tr><td colspan="9" class="p-6 text-center text-on-surface-variant">Cargando créditos...</td></tr>`);try{y=await ne()}catch(e){f(`Error cargando créditos: `+e.message,`error`),y=[]}}var x=e=>`$`+new Intl.NumberFormat(`es-CO`).format(Math.round(e||0));function Ie(e,t){if(!e)return 0;let n=e=>{if(!e)return null;let t=String(e).split(`/`);return t.length===3?new Date(t[2],t[1]-1,t[0]):new Date(e)},r=n(e),i=t?n(t):new Date;return!r||isNaN(r)?0:Math.max(0,Math.floor((i-r)/864e5))}function Le(e){return e?e.split(`;`).filter(Boolean).map(e=>{let t=e.split(`|`);return{fecha:t[0]||``,monto:parseFloat(t[1])||0,nota:t[2]||``}}):[]}function Re(e){return e.map(e=>`${e.fecha}|${e.monto}|${e.nota}`).join(`;`)}function ze(e){let t=0,n=0;e.forEach(e=>{e.estado!==`Cancelado`&&(t+=e.saldo||0),n+=e.abonado||0});let r=document.getElementById(`cred-stat-total`),i=document.getElementById(`cred-stat-recaudo`);r&&(r.textContent=x(t)),i&&(i.textContent=x(n))}function S(e){ze(y);let t=document.getElementById(`cred-table-body`);if(t){if(e.length===0){t.innerHTML=`<tr><td colspan="9" class="p-6 text-center text-on-surface-variant">No se encontraron créditos</td></tr>`;return}t.innerHTML=e.map(e=>{let t=e.estado===`Cancelado`||e.estado===`Entregado`,n=Ie(e.fecha,t?e.fechaCancelacion:null),r=t?`bg-green-100 text-green-800`:e.estado===`En Mora`?`bg-red-100 text-red-800`:`bg-orange-100 text-orange-800`,i=e.tipo===`Plan Separe`?`bg-emerald-100 text-emerald-800 border-emerald-200`:`bg-blue-100 text-blue-800 border-blue-200`,a=t?`<span class="text-[10px] text-on-surface-variant">Pagó en ${n}d</span>`:`<span class="text-[10px] font-bold ${n>30?`text-red-500`:`text-orange-500`}">${n} días</span>`,o=String(e.telefono||``).replace(/\D/g,``),s=`https://wa.me/57${o}?text=${encodeURIComponent(`Hola ${e.cliente}, le recordamos que tiene un saldo pendiente de ${x(e.saldo)} con nosotros. Gracias.`)}`;return`
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
        <td class="px-4 py-3 text-sm font-medium">${x(e.total)}</td>
        <td class="px-4 py-3 text-sm font-medium text-green-600">${x(e.abonado)}</td>
        <td class="px-4 py-3 text-sm font-black text-error">${x(e.saldo)}</td>
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
    `}).join(``)}}function Be(){let e=document.getElementById(`cred-search`),t=document.getElementById(`cred-filter-status`),n=document.getElementById(`cred-filter-tipo`),r=()=>{let r=(e?.value||``).toLowerCase().trim(),i=t?.value||``,a=n?.value||``;S(y.filter(e=>{let t=(e.cliente||``).toLowerCase().includes(r)||(e.idFactura||``).toLowerCase().includes(r),n=i?e.estado===i:!0,o=a?(e.tipo||`Crédito`)===a:!0;return t&&n&&o}))};e?.addEventListener(`input`,r),t?.addEventListener(`change`,r),n?.addEventListener(`change`,r);let i=e=>{let t=e.target.value.replace(/\D/g,``);e.target.value=t?new Intl.NumberFormat(`es-CO`).format(parseInt(t)):``};document.getElementById(`cred-new-total`)?.addEventListener(`input`,i),document.getElementById(`cred-new-abono`)?.addEventListener(`input`,i),document.getElementById(`cred-monto-abono`)?.addEventListener(`input`,i);let a=document.getElementById(`cred-modal`),o=document.getElementById(`cred-modal-close`),s=document.getElementById(`cred-modal-backdrop`),c=document.getElementById(`cred-save-btn`),l=()=>{a?.classList.add(`hidden`),a?.classList.remove(`flex`)};o?.addEventListener(`click`,l),s?.addEventListener(`click`,l),window.credAddAbono=e=>{let t=y.find(t=>t.id==e);if(!t)return;document.getElementById(`cred-id`).value=t.id,document.getElementById(`cred-cliente-name`).textContent=t.cliente,document.getElementById(`cred-saldo-actual`).textContent=x(t.saldo);let n=Le(t.historialAbonos),r=document.getElementById(`cred-historial`);r&&(r.innerHTML=n.length===0?`<p class="text-xs text-on-surface-variant">Sin abonos anteriores</p>`:n.map(e=>`
            <div class="flex justify-between items-center py-1 border-b border-surface-variant text-xs">
              <span class="text-on-surface-variant">${e.fecha}</span>
              <span class="font-bold text-green-600">${x(e.monto)}</span>
              <span class="text-on-surface-variant">${e.nota||``}</span>
            </div>`).join(``)),document.getElementById(`cred-monto-abono`).value=``,document.getElementById(`cred-nota-abono`).value=``,a?.classList.remove(`hidden`),a?.classList.add(`flex`),document.getElementById(`cred-monto-abono`)?.focus()},c?.addEventListener(`click`,async()=>{let e=document.getElementById(`cred-id`).value,t=parseInt((document.getElementById(`cred-monto-abono`).value||``).replace(/\D/g,``))||0,n=(document.getElementById(`cred-nota-abono`)?.value||``).trim();if(!t||t<=0){f(`Ingresa un monto válido`,`warning`);return}if(!Ne){Ne=!0,c.textContent=`Aplicando...`,c.disabled=!0;try{let r=y.find(t=>t.id==e),i=(r.abonado||0)+t,a=Math.max(0,(r.total||0)-i),o=a<=0,s=Le(r.historialAbonos);s.push({fecha:new Date().toLocaleDateString(`es-CO`),monto:t,nota:n});let c=r.tipo===`Plan Separe`,u=c?`Separado`:`Activo`,d=c?`Entregado`:`Cancelado`,ee=await ie(e,{...r,abonado:i,saldo:a,estado:o||r.estado===`Cancelado`||r.estado===`Entregado`?d:u,fechaCancelacion:o?new Date().toLocaleDateString(`es-CO`):r.fechaCancelacion||``,historialAbonos:Re(s)});ee?.success?(f(o?`✅ ¡Crédito cancelado!`:`Abono registrado`,`success`),l(),b=!1,await Fe(),S(y)):f(ee?.mensaje||`Error al guardar`,`error`)}catch(e){f(`Error: `+e.message,`error`)}finally{Ne=!1,c.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Aplicar Abono`,c.disabled=!1}}});let u=document.getElementById(`cred-new-modal`),d=()=>{u?.classList.add(`hidden`),u?.classList.remove(`flex`)};document.getElementById(`cred-new-btn`)?.addEventListener(`click`,()=>{document.getElementById(`cred-new-form`)?.reset(),document.getElementById(`cred-new-cliente`).value=``,document.getElementById(`cred-new-cliente-doc`).value=``,u?.classList.remove(`hidden`),u?.classList.add(`flex`)}),document.getElementById(`cred-new-close`)?.addEventListener(`click`,d),document.getElementById(`cred-new-backdrop`)?.addEventListener(`click`,d),document.getElementById(`cred-select-client-btn`)?.addEventListener(`click`,()=>{je(e=>{document.getElementById(`cred-new-cliente`).value=e.nombre,document.getElementById(`cred-new-cliente-doc`).value=e.cedula||e.documento||e.telefono||``})}),document.getElementById(`cred-save-new-btn`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`cred-new-cliente`).value.trim(),t=document.getElementById(`cred-new-cliente-doc`).value.trim(),n=parseInt((document.getElementById(`cred-new-total`).value||``).replace(/\D/g,``))||0,r=parseInt((document.getElementById(`cred-new-abono`)?.value||``).replace(/\D/g,``))||0,i=document.getElementById(`cred-new-detalle`).value.trim();if(!e||!n){f(`Cliente y monto son requeridos`,`warning`);return}let a=document.getElementById(`cred-save-new-btn`);a.disabled=!0,a.textContent=`Guardando...`;try{let a=await re({cliente:e,telefono:t,total:n,detalle:i,historialAbonos:r>0?Re([{fecha:new Date().toLocaleDateString(`es-CO`),monto:r,nota:`Abono inicial`}]):``});a?.success?(f(`Crédito creado`,`success`),d(),b=!1,await Fe(),S(y)):f(a?.mensaje||`Error al crear crédito`,`error`)}catch(e){f(`Error: `+e.message,`error`)}finally{a.disabled=!1,a.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`}})}var C=[],w=[];function Ve(){return async()=>{document.getElementById(`sales-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();w=C.filter(e=>(e.id_factura||``).toLowerCase().includes(t)||(e.cliente||``).toLowerCase().includes(t)||(e.cedula||``).toLowerCase().includes(t)),Ue()});let e=()=>document.getElementById(`sale-detail-modal`).classList.add(`hidden`);document.getElementById(`sale-detail-close`)?.addEventListener(`click`,e),document.getElementById(`sale-detail-backdrop`)?.addEventListener(`click`,e),await He()}}async function He(){let e=document.getElementById(`sales-history-list`);if(e)try{e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">Cargando todas las ventas...</td></tr>`,C=await te(),w=[...C],Ue()}catch(t){e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-error italic text-sm">Error: ${t.message}</td></tr>`}}function Ue(){let e=document.getElementById(`sales-history-list`);if(e){if(w.length===0){e.innerHTML=`<tr><td colspan="7" class="p-8 text-center text-on-surface-variant italic text-sm">No se encontraron ventas</td></tr>`;return}e.innerHTML=w.map((e,t)=>{let n=new Date(e.fecha).toLocaleDateString(`es-CO`,{day:`2-digit`,month:`short`}),r=new Intl.NumberFormat(`es-CO`).format(e.total||0);return`
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
    `}).join(``)}}window.viewSaleDetail=e=>{let t=C.find(t=>t.id_factura===e);if(!t)return;let n=document.getElementById(`sale-detail-modal`),r=document.getElementById(`sale-detail-content`),i=e=>new Intl.NumberFormat(`es-CO`).format(e||0);r.innerHTML=`
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
  `,n.classList.remove(`hidden`),n.classList.add(`flex`)};var T=[],We=!1;function Ge(){return async()=>{Ke(),We||=(await E(),!0)}}function Ke(){let e=document.getElementById(`task-new-btn`),t=document.getElementById(`task-modal-close`),n=document.getElementById(`task-modal-backdrop`),r=document.getElementById(`task-form`);e?.replaceWith(e.cloneNode(!0)),t?.replaceWith(t.cloneNode(!0)),n?.replaceWith(n.cloneNode(!0)),r?.replaceWith(r.cloneNode(!0)),document.getElementById(`task-new-btn`)?.addEventListener(`click`,Xe),document.getElementById(`task-modal-close`)?.addEventListener(`click`,Ze),document.getElementById(`task-modal-backdrop`)?.addEventListener(`click`,Ze),document.getElementById(`task-form`)?.addEventListener(`submit`,Qe)}async function E(){let e=document.getElementById(`task-list`);try{T=await ve(),qe()}catch(t){e.innerHTML=`<li class="p-8 text-center text-error">Error: ${t.message}</li>`}}function qe(){let e=document.getElementById(`task-list`);if(!T||T.length===0){e.innerHTML=`<li class="p-12 text-center text-on-surface-variant italic text-sm">No hay tareas. ¡Buen trabajo!</li>`;return}e.innerHTML=T.map(e=>{let t=e.estado===`Completada`;return`
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
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full ${Je(e.prioridad)}">${e.prioridad}</span>
          <p class="text-[10px] text-on-surface-variant mt-1">${Ye(e.fecha_vencimiento)}</p>
        </div>
        <button onclick="window.deleteTask('${e.id}')" class="p-2 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </li>
    `}).join(``)}function Je(e){return e===`Alta`?`bg-red-100 text-red-700`:e===`Media`?`bg-blue-100 text-blue-700`:`bg-slate-100 text-slate-700`}function Ye(e){return e?new Date(e+`T12:00:00`).toLocaleDateString(`es-CO`,{day:`numeric`,month:`short`}):`—`}function Xe(){let e=document.getElementById(`task-modal`);document.getElementById(`task-form`).reset(),document.getElementById(`task-input-date`).value=new Date().toISOString().slice(0,10),e.classList.remove(`hidden`),e.classList.add(`flex`)}function Ze(){document.getElementById(`task-modal`).classList.add(`hidden`),document.getElementById(`task-modal`).classList.remove(`flex`)}async function Qe(e){e.preventDefault();let t=document.getElementById(`task-save-btn`);t.disabled=!0,t.innerHTML=`Guardando...`;let n={tarea:document.getElementById(`task-input-title`).value.trim(),fecha_inicio:new Date().toISOString().slice(0,10),fecha_vencimiento:document.getElementById(`task-input-date`).value,prioridad:document.getElementById(`task-input-priority`).value,responsable:JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).nombre||`Admin`,notas:document.getElementById(`task-input-notes`).value.trim(),estado:`Pendiente`,color:$e(document.getElementById(`task-input-priority`).value)};try{await ye(n)&&(f(`Tarea creada`,`success`),Ze(),await E())}catch{f(`Error al guardar`,`error`)}finally{t.disabled=!1,t.innerHTML=`<span class="material-symbols-outlined text-[20px]">save</span> Guardar Tarea`}}function $e(e){return e===`Alta`?`#ef4444`:e===`Media`?`#3b82f6`:`#64748b`}window.toggleTaskStatus=async(e,t)=>{let n=t===`Completada`?`Pendiente`:`Completada`;try{await be(e,n),await E()}catch(e){console.error(e)}},window.deleteTask=async e=>{if(confirm(`¿Eliminar tarea?`))try{await xe(e),await E()}catch(e){console.error(e)}};function et(){return async()=>{await tt()}}async function tt(){let e=document.getElementById(`calendar-container`);if(e)try{let t=await ve(),n=new Date,r=n.getDay(),i=n.getDate()-r+(r===0?-6:1),a=new Date(n.setDate(i));a.setHours(0,0,0,0);let o=`<div class="grid grid-cols-7 gap-2 h-full">`;[`Lun`,`Mar`,`Mié`,`Jue`,`Vie`,`Sáb`,`Dom`].forEach(e=>{o+=`<div class="text-center text-[11px] font-black uppercase tracking-widest text-on-surface-variant pb-3 border-b-2 border-surface-variant/50">${e}</div>`});for(let e=0;e<7;e++){let n=new Date(a);n.setDate(a.getDate()+e);let r=n.toDateString()===new Date().toDateString(),i=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,`0`)}-${String(n.getDate()).padStart(2,`0`)}`,s=(t||[]).filter(e=>e.fecha_vencimiento&&e.fecha_vencimiento.startsWith(i));o+=`
        <div class="min-h-[450px] rounded-xl p-3 flex flex-col gap-2 transition-all border-2 
             ${r?`border-primary bg-primary/5 shadow-inner`:`border-transparent bg-surface-container-lowest/50`}">
          
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-black ${r?`text-primary`:`text-on-surface-variant/70`}">${n.getDate()}</span>
            ${r?`<span class="px-1.5 py-0.5 bg-primary text-[9px] text-white rounded font-bold uppercase">Hoy</span>`:``}
          </div>

          <div class="flex flex-col gap-2">
            ${s.length>0?s.map(e=>`
              <div class="p-2.5 rounded-lg text-[10px] font-bold leading-tight shadow-sm border-l-[4px] bg-white group hover:scale-[1.02] transition-transform cursor-pointer" 
                   style="border-color: ${e.color||`#4f46e5`}; color: #1e293b">
                <div class="flex justify-between items-start mb-0.5">
                   <span class="uppercase tracking-tighter text-[8px] opacity-70">${e.prioridad||`Media`}</span>
                </div>
                ${e.tarea}
              </div>
            `).join(``):`<div class="flex-1 flex items-center justify-center pt-10 opacity-10">
                 <span class="material-symbols-outlined text-4xl">event_busy</span>
              </div>`}
          </div>
        </div>
      `}o+=`</div>`,e.innerHTML=o}catch(t){e.innerHTML=`<div class="p-10 text-center text-error font-bold">Error cargando calendario: ${t.message}</div>`}}var D=[],nt=!1,O=!1,k,A,j,rt,M,it,at,ot,st,ct,N,lt,ut,P,F;function dt(){return async()=>{ft(),nt||=(await I(),pt(),!0),L(D)}}function ft(){k=document.getElementById(`ped-table-body`),A=document.getElementById(`ped-search`),j=document.getElementById(`ped-filter-status`),rt=document.getElementById(`ped-new-btn`),M=document.getElementById(`ped-modal`),it=document.getElementById(`ped-modal-close`),at=document.getElementById(`ped-modal-backdrop`),ot=document.getElementById(`ped-form`),st=document.getElementById(`ped-save-btn`),ct=document.getElementById(`ped-id`),N=document.getElementById(`ped-producto`),lt=document.getElementById(`ped-categoria`),ut=document.getElementById(`ped-proveedor`),P=document.getElementById(`ped-costo`),F=document.getElementById(`ped-precio`)}async function I(){try{k&&(k.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando reventas...</td></tr>`),D=await ae()}catch(e){f(`Error cargando reventas: `+e.message,`error`),D=[]}}function L(e){if(k){if(e.length===0){k.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron reventas</td></tr>`;return}k.innerHTML=e.map(e=>{let t=Number(e.costo||0),n=Number(e.precio||0),r=Number(e.utilidad||n-t),i=e=>new Intl.NumberFormat(`es-CO`).format(e);return`
      <tr class="hover:bg-surface-container-low transition-colors text-sm">
        <td class="px-4 py-3 font-mono font-bold">${e.id||`-`}</td>
        <td class="px-4 py-3 font-bold">${e.producto||`-`}</td>
        <td class="px-4 py-3"><span class="px-2 py-0.5 bg-surface-container rounded text-[10px] font-medium">${e.categoria||`Otros`}</span></td>
        <td class="px-4 py-3">
          <p class="text-[10px] text-on-surface-variant">C: $${i(t)}</p>
          <p class="font-bold text-primary">V: $${i(n)}</p>
        </td>
        <td class="px-4 py-3 font-bold ${r>=0?`text-green-600`:`text-error`}">$${i(r)}</td>
        <td class="px-4 py-3 text-right">
          <button onclick="window.pedDelete('${e.id}')" class="p-1.5 text-on-surface-variant hover:text-error rounded-lg">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </td>
      </tr>
    `}).join(``)}}function pt(){let e=()=>{if(!A)return;let e=A.value.toLowerCase().trim(),t=j?j.value:``;L(D.filter(n=>{let r=(n.producto||``).toLowerCase().includes(e)||(n.id||``).toLowerCase().includes(e),i=t?n.categoria===t:!0;return r&&i}))};A?.addEventListener(`input`,e),j?.addEventListener(`change`,e);let t=e=>{let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))};P?.addEventListener(`input`,t),F?.addEventListener(`input`,t),rt?.addEventListener(`click`,()=>mt(null)),it?.addEventListener(`click`,R),at?.addEventListener(`click`,R),st?.addEventListener(`click`,ht),window.pedDelete=async e=>{if(confirm(`¿Eliminar la reventa ${e}?`))try{let t=await se(e);t&&t.success&&(f(`Eliminada`,`success`),await I(),L(D))}catch(e){f(e.message,`error`)}}}function mt(e){M&&(ot?.reset(),e&&(ct&&(ct.value=e.id),N&&(N.value=e.producto||``),P&&(P.value=e.costo||0),F&&(F.value=e.precio||0)),M.classList.remove(`hidden`),M.classList.add(`flex`))}function R(){M?.classList.add(`hidden`),M?.classList.remove(`flex`)}async function ht(){if(!O){O=!0;try{(await oe({producto:N?.value.trim(),categoria:lt?.value,proveedor:ut?.value.trim(),costo:parseInt(P?.value.replace(/\D/g,``))||0,precio:parseInt(F?.value.replace(/\D/g,``))||0})).success&&(f(`Guardado`,`success`),R(),await I(),L(D))}catch(e){f(e.message,`error`)}finally{O=!1}}}var z=[],gt=!1,_t=!1,B=null;function vt(){return async()=>{gt||=(await yt(),xt(),!0),V(z)}}async function yt(){let e=document.getElementById(`tech-grid`);try{e&&(e.innerHTML=`<p class="col-span-full text-center p-10 opacity-50 italic">Cargando servicios...</p>`),z=await ce()}catch{f(`Error al cargar datos`,`error`),z=[]}}function V(e){let t=document.getElementById(`tech-grid`);if(!t)return;if(e.length===0){t.innerHTML=`<p class="col-span-full text-center p-20 opacity-30 italic text-sm">No hay órdenes de servicio activas</p>`;return}let n=e=>new Intl.NumberFormat(`es-CO`).format(e||0);t.innerHTML=e.map(e=>{let t=(e.precio_final||0)-(e.abono||0);return`
      <div class="bg-surface-container-lowest border border-surface-variant rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
        <div class="flex justify-between items-start mb-3">
          <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-md">${e.id_orden}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${bt(e.estado)}">${e.estado}</span>
        </div>
        
        <h3 class="font-black text-on-surface text-base mb-1 truncate">${e.equipo}</h3>
        <p class="text-xs font-bold text-on-surface-variant mb-3 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">person</span> ${e.cliente}
        </p>

        <div class="bg-surface-container-low rounded-xl p-3 mb-4">
          <p class="text-[10px] uppercase font-bold text-on-surface-variant/60 mb-1">Falla Reportada</p>
          <p class="text-xs text-on-surface italic line-clamp-2">${e.falla}</p>
        </div>

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
          <button onclick="window.techEdit('${e.id_orden}')" class="flex-1 py-2 bg-surface border border-surface-variant rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">edit</span> Editar
          </button>
          <button onclick="window.techDelete('${e.id_orden}')" class="p-2 bg-surface border border-surface-variant rounded-xl text-error hover:bg-error/5 transition-colors">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    `}).join(``)}function bt(e){return{Ingresado:`bg-slate-100 text-slate-700`,"En Revisión":`bg-blue-100 text-blue-700`,"En Taller":`bg-blue-100 text-blue-700`,Reparado:`bg-green-100 text-green-700`,Entregado:`bg-emerald-600 text-white`,"Sin Arreglo":`bg-red-100 text-red-700`}[e]||`bg-slate-100 text-slate-600`}function xt(){document.getElementById(`tech-search`)?.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim();V(z.filter(e=>e.cliente.toLowerCase().includes(t)||e.id_orden.toLowerCase().includes(t)||e.equipo.toLowerCase().includes(t)))}),document.getElementById(`tech-new-btn`)?.addEventListener(`click`,()=>St()),document.getElementById(`tech-modal-close`)?.addEventListener(`click`,H),document.getElementById(`tech-modal-backdrop`)?.addEventListener(`click`,H),document.getElementById(`tech-form`)?.addEventListener(`submit`,Ct),window.techEdit=e=>{let t=z.find(t=>t.id_orden===e);t&&St(t)},window.techDelete=async e=>{if(confirm(`¿Eliminar orden ${e}?`))try{(await de(e)).success&&(f(`Orden eliminada`,`success`),await yt(),V(z))}catch(e){f(e.message,`error`)}}}function St(e=null){B=e?e.id_orden:null,document.getElementById(`tech-form`).reset(),document.getElementById(`tech-modal-title`).textContent=e?`Editar Orden`:`Ingreso a Servicio Técnico`,e&&(document.getElementById(`tech-cliente`).value=e.cliente,document.getElementById(`tech-equipo`).value=e.equipo,document.getElementById(`tech-falla`).value=e.falla,document.getElementById(`tech-costo`).value=new Intl.NumberFormat(`es-CO`).format(e.precio_final||0),document.getElementById(`tech-estado`).value=e.estado);let t=document.getElementById(`tech-modal`);t.classList.remove(`hidden`),t.classList.add(`flex`)}function H(){let e=document.getElementById(`tech-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)}async function Ct(e){if(e.preventDefault(),_t)return;_t=!0;let t=document.getElementById(`tech-save-btn`);t.disabled=!0;let n=[B||`ST-${Date.now().toString().slice(-6)}`,document.getElementById(`tech-cliente`).value.trim(),`310`,document.getElementById(`tech-equipo`).value.trim(),`S/N`,document.getElementById(`tech-falla`).value.trim(),`0000`,``,0,0,parseInt(document.getElementById(`tech-costo`).value.replace(/\D/g,``))||0,document.getElementById(`tech-estado`).value,``];try{(B?await ue(B,n):await le(n)).success&&(f(B?`Actualizado`:`Ingresado`,`success`),H(),await yt(),V(z))}catch(e){f(e.message,`error`)}finally{_t=!1,t.disabled=!1}}var U=[],wt=!1,W=!1,G,Tt,Et,Dt,K,Ot,kt,q,J,Y,At,jt,X;function Mt(){return async()=>{Nt(),wt||=(await Pt(),It(),!0),Ft(U)}}function Nt(){G=document.getElementById(`exp-table-body`),Tt=document.getElementById(`exp-search`),Et=document.getElementById(`exp-filter-cat`),Dt=document.getElementById(`exp-new-btn`),K=document.getElementById(`exp-modal`),Ot=document.getElementById(`exp-modal-close`),kt=document.getElementById(`exp-modal-backdrop`),q=document.getElementById(`exp-form`),J=document.getElementById(`exp-save-btn`),Y=document.getElementById(`exp-monto`),At=document.getElementById(`exp-categoria`),jt=document.getElementById(`exp-concepto`),X=document.getElementById(`exp-responsable`)}async function Pt(){try{G.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">Cargando egresos...</td></tr>`,U=await fe()}catch(e){f(`Error cargando egresos: `+e.message,`error`),U=[]}}function Ft(e){if(e.length===0){G.innerHTML=`<tr><td colspan="6" class="p-4 text-center text-on-surface-variant">No se encontraron egresos</td></tr>`;return}G.innerHTML=e.map(e=>`
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
    `).join(``)}function It(){let e=()=>{let e=Tt.value.toLowerCase().trim(),t=Et.value;Ft(U.filter(n=>{let r=(n.concepto||``).toLowerCase().includes(e)||(n.responsable||``).toLowerCase().includes(e)||(n.id||``).toLowerCase().includes(e),i=t?n.categoria===t:!0;return r&&i}))};Tt.addEventListener(`input`,e),Et.addEventListener(`change`,e),Y.addEventListener(`input`,e=>{let t=e.target.value.replace(/\D/g,``);if(!t){e.target.value=``;return}e.target.value=new Intl.NumberFormat(`es-CO`).format(parseInt(t,10))}),Dt.addEventListener(`click`,()=>Lt()),Ot.addEventListener(`click`,Rt),kt.addEventListener(`click`,Rt),J.addEventListener(`click`,zt)}function Lt(){q.reset();try{let e=localStorage.getItem(`adminpro_user`);if(e){let t=JSON.parse(e);X.value=t.nombre||t.email}}catch{X.value=`Sistema`}K.classList.remove(`hidden`),K.classList.add(`flex`),Y.focus()}function Rt(){K.classList.add(`hidden`),K.classList.remove(`flex`)}async function zt(){if(!q.checkValidity()){q.reportValidity();return}if(!W){W=!0,J.textContent=`Registrando...`,J.disabled=!0;try{let e=await pe({monto:parseInt(Y.value.replace(/\D/g,``))||0,categoria:At.value,concepto:jt.value.trim(),responsable:X.value});e&&e.success?(f(`Egreso registrado`,`success`),Rt(),await Pt(),Ft(U)):f(e?.mensaje||`Error al registrar`,`error`)}catch(e){f(`Error de conexión: `+e.message,`error`)}finally{W=!1,J.innerHTML=`<span class="material-symbols-outlined text-[18px]">save</span> Guardar`,J.disabled=!1}}}var Z=[],Bt=!1,Q=null;function Vt(){return async()=>{Bt||=(await Ht(),Wt(),!0),Ut()}}async function Ht(){let e=document.getElementById(`users-table-body`);e&&(e.innerHTML=`<tr><td colspan="4" class="p-8 text-center opacity-50">Cargando usuarios...</td></tr>`);try{Z=await me()}catch{f(`Error cargando usuarios`,`error`),Z=[]}}function Ut(){let e=document.getElementById(`users-table-body`);if(e){if(Z.length===0){e.innerHTML=`<tr><td colspan="4" class="p-10 text-center opacity-40 italic">No hay usuarios registrados</td></tr>`;return}e.innerHTML=Z.map(e=>`
    <tr class="hover:bg-surface-container-low transition-colors text-sm border-b border-surface-variant/30">
      <td class="px-4 py-4">
        <p class="font-bold text-on-surface">${e.nombre}</p>
        <p class="text-[11px] text-on-surface-variant">${e.email}</p>
      </td>
      <td class="px-4 py-4">
        <span class="px-2 py-0.5 bg-surface-container rounded text-[10px] font-bold text-on-surface-variant uppercase">${e.rol}</span>
      </td>
      <td class="px-4 py-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${e.estado===`Activo`?`bg-green-100 text-green-700`:`bg-red-100 text-red-700`}">${e.estado}</span>
      </td>
      <td class="px-4 py-4 text-right space-x-1">
        <button onclick="window.userEdit('${e.email}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><span class="material-symbols-outlined text-[18px]">edit</span></button>
        <button onclick="window.userDelete('${e.email}')" class="p-1.5 text-on-surface-variant hover:text-error rounded-lg"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </td>
    </tr>
  `).join(``)}}function Wt(){document.getElementById(`users-new-btn`)?.addEventListener(`click`,()=>Gt()),document.getElementById(`users-modal-close`)?.addEventListener(`click`,Kt),document.getElementById(`users-modal-backdrop`)?.addEventListener(`click`,Kt),document.getElementById(`users-form`)?.addEventListener(`submit`,qt),window.userEdit=e=>{let t=Z.find(t=>t.email===e);t&&Gt(t)},window.userDelete=async e=>{if(e===JSON.parse(localStorage.getItem(`adminpro_user`)||`{}`).email)return f(`No puedes eliminarte a ti mismo`,`warning`);if(confirm(`¿Eliminar al usuario ${e}?`))try{(await _e(e)).success&&(f(`Eliminado`,`success`),await Ht(),Ut())}catch(e){f(e.message,`error`)}}}function Gt(e=null){Q=e?e.email:null,document.getElementById(`users-form`).reset(),document.getElementById(`users-modal-title`).textContent=e?`Editar Usuario`:`Nuevo Usuario`,e&&(document.getElementById(`user-original-email`).value=e.email,document.getElementById(`user-nombre`).value=e.nombre,document.getElementById(`user-email`).value=e.email,document.getElementById(`user-password`).value=e.password,document.getElementById(`user-rol`).value=e.rol,document.getElementById(`user-estado`).value=e.estado);let t=document.getElementById(`users-modal`);t.classList.remove(`hidden`),t.classList.add(`flex`)}function Kt(){let e=document.getElementById(`users-modal`);e.classList.add(`hidden`),e.classList.remove(`flex`)}async function qt(e){e.preventDefault();let t=document.getElementById(`user-save-btn`);t.disabled=!0,t.textContent=`Guardando...`;let n=[document.getElementById(`user-email`).value.trim().toLowerCase(),document.getElementById(`user-password`).value.trim(),document.getElementById(`user-nombre`).value.trim(),document.getElementById(`user-rol`).value,document.getElementById(`user-estado`).value];try{(Q?await ge(Q,n):await he(n)).success&&(f(Q?`Actualizado`:`Creado`,`success`),Kt(),await Ht(),Ut())}catch(e){f(e.message,`error`)}finally{t.disabled=!1,t.textContent=`Guardar Usuario`}}function Jt(){return()=>{Yt(),Xt()}}function Yt(){let e=document.getElementById(`set-avatar`),t=document.getElementById(`set-name`),n=document.getElementById(`set-role`),r=document.getElementById(`set-email`);try{let i=localStorage.getItem(`adminproSession`),a=localStorage.getItem(`adminpro_user`),o=i?JSON.parse(i):a?JSON.parse(a):null;o?(t&&(t.textContent=o.nombre||`Usuario`),n&&(n.textContent=o.rol||`Administrador`),r&&(r.textContent=o.email||`No disponible`),e&&(e.textContent=(o.nombre?o.nombre.charAt(0):`U`).toUpperCase())):console.warn(`No se encontró sesión activa para cargar el perfil.`)}catch(e){console.error(`Error loading profile`,e)}let i=document.getElementById(`set-theme-toggle`);i&&(i.checked=document.documentElement.classList.contains(`dark`))}function Xt(){let e=document.getElementById(`set-logout-btn`);e?.replaceWith(e.cloneNode(!0)),document.getElementById(`set-logout-btn`)?.addEventListener(`click`,()=>{confirm(`¿Estás seguro de que deseas cerrar sesión?`)&&o()});let t=document.getElementById(`set-theme-toggle`);t?.replaceWith(t.cloneNode(!0)),document.getElementById(`set-theme-toggle`)?.addEventListener(`change`,e=>{e.target.checked?(document.documentElement.classList.add(`dark`),localStorage.setItem(`adminpro_theme`,`dark`)):(document.documentElement.classList.remove(`dark`),localStorage.setItem(`adminpro_theme`,`light`))})}function Zt(){try{let e=JSON.parse(localStorage.getItem(`adminproSession`)||`null`);return e&&Date.now()<e.expiresAt?e:null}catch{return null}}function Qt(e,t){i(t),localStorage.setItem(`adminproSession`,JSON.stringify({...e,token:t,expiresAt:Date.now()+480*60*1e3}))}function $t(){i(null),localStorage.removeItem(`adminproSession`),localStorage.removeItem(`adminpro_user`)}var en=()=>document.getElementById(`step-credentials`),tn=()=>document.getElementById(`step-pin`);function nn(e){en().classList.toggle(`hidden`,e!==`credentials`),tn().classList.toggle(`hidden`,e!==`pin`)}var rn=``;async function an(e){e.preventDefault();let t=document.getElementById(`login-btn`),n=document.getElementById(`login-email`).value.trim(),r=document.getElementById(`login-pwd`).value.trim();t.disabled=!0,t.textContent=`Verificando...`;try{let e=await l(n,r);e.success&&e.step===`pin`?(rn=n,document.getElementById(`pin-hint`).textContent=`Enviamos un PIN a ${n}`,nn(`pin`),document.getElementById(`login-pin`).focus()):f(e.mensaje||`Credenciales incorrectas`,`error`)}catch{f(`Error de conexión`,`error`)}finally{t.disabled=!1,t.textContent=`Ingresar`}}async function on(e){e.preventDefault();let t=document.getElementById(`pin-btn`),n=document.getElementById(`login-pin`).value.trim();t.disabled=!0,t.textContent=`Verificando...`;try{let e=await u(rn,n);e.success&&e.token?(Qt({email:e.email,nombre:e.nombre,rol:e.rol},e.token),un(e.nombre)):f(e.mensaje||`PIN incorrecto`,`error`)}catch{f(`Error`,`error`)}finally{t.disabled=!1,t.textContent=`Verificar`}}var sn=[{id:`dashboard`,label:`Dashboard`,icon:`dashboard`},{id:`pos`,label:`Ventas (POS)`,icon:`point_of_sale`},{id:`sales-history`,label:`Historial de Ventas`,icon:`history`},{id:`inventory`,label:`Inventario`,icon:`inventory_2`},{id:`tasks`,label:`Tareas`,icon:`check_circle`},{id:`calendar`,label:`Calendario`,icon:`calendar_month`},{id:`imei`,label:`Equipos IMEI`,icon:`phone_android`},{id:`clients`,label:`Clientes`,icon:`people`},{id:`credits`,label:`Créditos`,icon:`credit_score`},{id:`reventas`,label:`Reventas`,icon:`storefront`},{id:`technical`,label:`Técnico`,icon:`build`},{id:`expenses`,label:`Egresos`,icon:`payments`},{id:`users`,label:`Usuarios`,icon:`manage_accounts`},{id:`settings`,label:`Ajustes`,icon:`settings`}];function cn(e,t=!1){let n=document.getElementById(e);n&&(t?n.innerHTML=[{id:`dashboard`,label:`Dashboard`,icon:`dashboard`},{id:`pos`,label:`Ventas`,icon:`point_of_sale`},{id:`inventory`,label:`Inventario`,icon:`inventory_2`},{id:`tasks`,label:`Tareas`,icon:`check_circle`},{id:`settings`,label:`Más`,icon:`menu`}].map(e=>`
      <button data-nav="${e.id}" class="nav-btn flex flex-col items-center justify-center gap-0.5 py-2 w-full text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[22px]">${e.icon}</span>
        <span class="text-[9px] font-semibold tracking-tight">${e.label}</span>
      </button>
    `).join(``):n.innerHTML=sn.map(e=>`
      <button data-nav="${e.id}" class="nav-btn flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150 text-sm font-medium">
        <span class="material-symbols-outlined text-[20px]">${e.icon}</span>
        <span>${e.label}</span>
      </button>
    `).join(``),n.querySelectorAll(`[data-nav]`).forEach(e=>{e.addEventListener(`click`,()=>navigate(e.dataset.nav))}))}function ln(e){document.querySelectorAll(`#desktop-nav [data-nav]`).forEach(t=>{let n=t.dataset.nav===e;t.classList.toggle(`bg-red-600`,n),t.classList.toggle(`text-white`,n)});let t=sn.find(t=>t.id===e),n=document.getElementById(`header-title`);n&&t&&(n.textContent=t.label)}function un(e){document.getElementById(`login-screen`).classList.add(`hidden`),document.getElementById(`app-shell`).classList.remove(`hidden`);let t=document.getElementById(`user-name`);t&&(t.textContent=e||`Usuario`),cn(`desktop-nav`,!1),cn(`mobile-nav`,!0),onRouteChange(ln),registerView(`inventory`,initInventory()),registerView(`dashboard`,initDashboard()),registerView(`pos`,initPOS()),registerView(`imei`,initIMEI()),registerView(`clients`,initClients()),registerView(`credits`,Pe()),registerView(`sales-history`,Ve()),registerView(`tasks`,Ge()),registerView(`calendar`,et()),registerView(`reventas`,dt()),registerView(`technical`,vt()),registerView(`expenses`,Mt()),registerView(`users`,Vt()),registerView(`settings`,Jt()),navigate(`dashboard`)}function dn(){document.getElementById(`app-shell`).classList.add(`hidden`),document.getElementById(`login-screen`).classList.remove(`hidden`),nn(`credentials`)}async function fn(){await o(),$t(),dn()}window.addEventListener(`session-expired`,()=>{$t(),dn()}),document.getElementById(`login-form`)?.addEventListener(`submit`,an),document.getElementById(`pin-form`)?.addEventListener(`submit`,on),document.getElementById(`back-to-login`)?.addEventListener(`click`,()=>nn(`credentials`)),document.getElementById(`logout-btn`)?.addEventListener(`click`,fn);var $=Zt();$&&$.token&&a()?(i($.token),un($.nombre)):($t(),dn());