// toast.js — Beautiful in-app notification toasts

export function showToast(message, type = "success") {
  const colors = {
    success: "bg-green-600",
    error: "bg-error",
    info: "bg-tertiary",
    warning: "bg-amber-500",
  };
  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const div = document.createElement("div");
  div.className = "fixed bottom-4 right-4 z-[9999] toast-animate";
  div.innerHTML = `
    <div class="flex items-center gap-3 px-5 py-3.5 rounded-xl text-white shadow-2xl ${colors[type] || colors.success} min-w-[280px] max-w-sm">
      <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1">${icons[type] || icons.success}</span>
      <span class="flex-1 text-sm font-semibold leading-tight">${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="opacity-60 hover:opacity-100 transition-opacity ml-2">
        <span class="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4500);
}
