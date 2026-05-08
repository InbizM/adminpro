import { getUsers, crearUsuario, actualizarUsuario, eliminarUsuario } from "../api.js";
import { showToast } from "../toast.js";

let _usuarios = [];
let _isLoaded = false;
let _isProcessing = false;
let _editingEmail = null;

export function initUsers() {
  return async () => {
    if (!_isLoaded) {
      await loadUsers();
      setupEvents();
      _isLoaded = true;
    }
    renderTable(_usuarios);
  };
}

async function loadUsers() {
  const table = document.getElementById("user-table-body");
  try {
    if (table) table.innerHTML = `<tr><td colspan="5" class="p-8 text-center opacity-50">Cargando equipo...</td></tr>`;
    _usuarios = await getUsers();
  } catch (err) {
    showToast("Error al cargar usuarios", "error");
    _usuarios = [];
  }
}

function renderTable(lista) {
  const container = document.getElementById("user-table-body");
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="p-10 text-center opacity-40 italic">No hay usuarios registrados</td></tr>`;
    return;
  }

  container.innerHTML = lista.map(u => `
    <tr class="hover:bg-surface-container-low transition-colors text-sm border-b border-surface-variant/30">
      <td class="px-4 py-4 font-bold text-on-surface">${u.nombre}</td>
      <td class="px-4 py-4 text-on-surface-variant">${u.email}</td>
      <td class="px-4 py-4 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.rol === 'Administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${u.rol}</span>
      </td>
      <td class="px-4 py-4 text-center">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${u.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}">
          <span class="w-1.5 h-1.5 rounded-full ${u.estado === 'Activo' ? 'bg-green-600' : 'bg-slate-400'}"></span>
          ${u.estado}
        </span>
      </td>
      <td class="px-4 py-4 text-right space-x-1">
        <button onclick="window.userEdit('${u.email}')" class="p-1.5 text-primary hover:bg-primary/10 rounded-lg" title="Editar"><span class="material-symbols-outlined text-[18px]">edit</span></button>
        <button onclick="window.userDelete('${u.email}')" class="p-1.5 text-on-surface-variant hover:text-error rounded-lg" title="Eliminar"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </td>
    </tr>
  `).join("");
}

function setupEvents() {
  document.getElementById("user-search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderTable(_usuarios.filter(u => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  });

  document.getElementById("user-new-btn")?.addEventListener("click", () => openModal());
  document.getElementById("user-modal-close")?.addEventListener("click", closeModal);
  document.getElementById("user-modal-backdrop")?.addEventListener("click", closeModal);
  document.getElementById("user-form")?.addEventListener("submit", saveUser);

  window.userEdit = (email) => {
    const u = _usuarios.find(x => x.email === email);
    if (u) openModal(u);
  };

  window.userDelete = async (email) => {
    const me = JSON.parse(localStorage.getItem("adminpro_user") || "{}");
    if (email === me.email) return showToast("No puedes eliminarte a ti mismo", "warning");
    
    if (!confirm(`¿Eliminar al usuario ${email}?`)) return;
    try {
      const res = await eliminarUsuario(email);
      if (res.success) {
        showToast("Usuario eliminado", "success");
        await loadUsers();
        renderTable(_usuarios);
      }
    } catch (err) { showToast(err.message, "error"); }
  };
}

function openModal(u = null) {
  _editingEmail = u ? u.email : null;
  const form = document.getElementById("user-form");
  form.reset();
  document.getElementById("user-modal-title").textContent = u ? "Editar Usuario" : "Nuevo Usuario";
  
  // Bloquear email en edición
  document.getElementById("user-input-email").disabled = !!u;

  if (u) {
    document.getElementById("user-input-name").value = u.nombre;
    document.getElementById("user-input-email").value = u.email;
    document.getElementById("user-input-password").value = u.password;
    document.getElementById("user-input-rol").value = u.rol;
    document.getElementById("user-input-estado").value = u.estado;
  }
  
  const modal = document.getElementById("user-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  const modal = document.getElementById("user-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function saveUser(e) {
  e.preventDefault();
  if (_isProcessing) return;
  _isProcessing = true;
  const btn = document.getElementById("user-save-btn");
  btn.disabled = true;
  btn.innerHTML = "Guardando...";

  const getVal = id => document.getElementById(id).value.trim();

  const datos = [
    getVal("user-input-email"),
    getVal("user-input-password"),
    getVal("user-input-name"),
    getVal("user-input-rol"),
    getVal("user-input-estado")
  ];

  try {
    // Si estamos editando, pasamos el email como ID
    const res = _editingEmail 
      ? await actualizarUsuario(_editingEmail, [datos[1], datos[2], datos[3], datos[4]]) // Actualizar sin el email
      : await crearUsuario(datos);
      
    if (res.success) {
      showToast(_editingEmail ? "Actualizado" : "Creado", "success");
      closeModal();
      await loadUsers();
      renderTable(_usuarios);
    }
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    _isProcessing = false;
    btn.disabled = false;
    btn.innerHTML = "Guardar Usuario";
  }
}
