import { logout } from "../api.js";

export function initSettings() {
  return () => {
    loadProfile();
    setupEvents();
  };
}

function loadProfile() {
  const elAvatar = document.getElementById("set-avatar");
  const elName = document.getElementById("set-name");
  const elRole = document.getElementById("set-role");
  const elEmail = document.getElementById("set-email");

  try {
    // Usamos la sesión principal que guarda main.js
    const sessionJson = localStorage.getItem("adminproSession");
    const userJson = localStorage.getItem("adminpro_user");
    
    // Intentamos obtener datos de cualquiera de las dos fuentes
    const user = sessionJson ? JSON.parse(sessionJson) : (userJson ? JSON.parse(userJson) : null);

    if (user) {
      if (elName) elName.textContent = user.nombre || "Usuario";
      if (elRole) elRole.textContent = user.rol || "Administrador";
      if (elEmail) elEmail.textContent = user.email || "No disponible";
      if (elAvatar) elAvatar.textContent = (user.nombre ? user.nombre.charAt(0) : "U").toUpperCase();
    } else {
      console.warn("No se encontró sesión activa para cargar el perfil.");
    }
  } catch (e) {
    console.error("Error loading profile", e);
  }

  // Cargar preferencia de tema
  const toggle = document.getElementById("set-theme-toggle");
  if (toggle) {
    toggle.checked = document.documentElement.classList.contains("dark");
  }
}

function setupEvents() {
  const btnLogout = document.getElementById("set-logout-btn");
  btnLogout?.replaceWith(btnLogout.cloneNode(true)); // Limpiar eventos previos
  document.getElementById("set-logout-btn")?.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout();
    }
  });

  const toggle = document.getElementById("set-theme-toggle");
  toggle?.replaceWith(toggle.cloneNode(true)); // Limpiar eventos previos
  document.getElementById("set-theme-toggle")?.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("adminpro_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("adminpro_theme", "light");
    }
  });
}
