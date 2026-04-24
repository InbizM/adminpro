// router.js — SPA router that shows/hides view containers
// Each view is a <section id="view-xxx"> in index.html

const views = {};
let activeViewId = null;
let onChangeCallback = null;

export function registerView(id, loadFn) {
  views[id] = loadFn;
}

export function onRouteChange(cb) {
  onChangeCallback = cb;
}

export async function navigate(viewId) {
  // Hide all views
  document.querySelectorAll("[data-view]").forEach((el) => {
    el.classList.add("hidden");
  });

  const target = document.querySelector(`[data-view="${viewId}"]`);
  if (!target) return console.warn("View not found:", viewId);

  target.classList.remove("hidden");
  activeViewId = viewId;

  if (onChangeCallback) onChangeCallback(viewId);

  // Call the view's load function if registered
  if (views[viewId]) {
    await views[viewId]();
  }
}

export function getActiveView() {
  return activeViewId;
}
