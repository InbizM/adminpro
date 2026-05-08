import { getTareas } from "../api.js";

export function initCalendar() {
  return async () => {
    await renderWeeklyCalendar();
  };
}

async function renderWeeklyCalendar() {
  const container = document.getElementById("calendar-container");
  if (!container) return;

  try {
    const tareas = await getTareas();
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sáb)
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar a Lunes
    
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    let html = `<div class="grid grid-cols-7 gap-2 h-full">`;
    
    // Cabeceras de los días
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    days.forEach(d => {
      html += `<div class="text-center text-[11px] font-black uppercase tracking-widest text-on-surface-variant pb-3 border-b-2 border-surface-variant/50">${d}</div>`;
    });

    // Celdas del calendario
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      
      const isToday = current.toDateString() === new Date().toDateString();
      
      // Formato YYYY-MM-DD para comparar con la base de datos
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      const isoDate = `${y}-${m}-${d}`;
      
      const tasksToday = (tareas || []).filter(t => t.fecha_vencimiento && t.fecha_vencimiento.startsWith(isoDate));

      html += `
        <div class="min-h-[450px] rounded-xl p-3 flex flex-col gap-2 transition-all border-2 
             ${isToday ? 'border-primary bg-primary/5 shadow-inner' : 'border-transparent bg-surface-container-lowest/50'}">
          
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-black ${isToday ? 'text-primary' : 'text-on-surface-variant/70'}">${current.getDate()}</span>
            ${isToday ? '<span class="px-1.5 py-0.5 bg-primary text-[9px] text-white rounded font-bold uppercase">Hoy</span>' : ''}
          </div>

          <div class="flex flex-col gap-2">
            ${tasksToday.length > 0 ? tasksToday.map(t => `
              <div class="p-2.5 rounded-lg text-[10px] font-bold leading-tight shadow-sm border-l-[4px] bg-white group hover:scale-[1.02] transition-transform cursor-pointer" 
                   style="border-color: ${t.color || '#4f46e5'}; color: #1e293b">
                <div class="flex justify-between items-start mb-0.5">
                   <span class="uppercase tracking-tighter text-[8px] opacity-70">${t.prioridad || 'Media'}</span>
                </div>
                ${t.tarea}
              </div>
            `).join("") : `<div class="flex-1 flex items-center justify-center pt-10 opacity-10">
                 <span class="material-symbols-outlined text-4xl">event_busy</span>
              </div>`}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div class="p-10 text-center text-error font-bold">Error cargando calendario: ${err.message}</div>`;
  }
}
