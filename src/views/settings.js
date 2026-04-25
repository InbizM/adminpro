import { logout } from "../api.js";

let _isLoaded = false;

export function initSettings() {
  return () => {
    if (!_isLoaded) {
      loadProfile();
      setupEvents();
      _isLoaded = true;
    }
  };
}

function loadProfile() {
  const elAvatar = document.getElementById("set-avatar");
  const elName = document.getElementById("set-name");
  const elRole = document.getElementById("set-role");
  const elEmail = document.getElementById("set-email");

  try {
    const userJson = localStorage.getItem("adminpro_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      elName.textContent = user.nombre || "Usuario";
      elRole.textContent = user.rol || "Administrador";
      elEmail.textContent = user.email || "No disponible";
      elAvatar.textContent = (user.nombre ? user.nombre.charAt(0) : "U").toUpperCase();
    }
  } catch (e) {
    console.error("Error loading profile", e);
  }

  // Load theme preference
  const toggle = document.getElementById("set-theme-toggle");
  toggle.checked = document.documentElement.classList.contains("dark");
}

function setupEvents() {
  const btnLogout = document.getElementById("set-logout-btn");
  btnLogout.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      logout();
    }
  });

  const toggle = document.getElementById("set-theme-toggle");
  toggle.addEventListener("change", (e) => {
    if (e.target.checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("adminpro_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("adminpro_theme", "light");
    }
  });
}
