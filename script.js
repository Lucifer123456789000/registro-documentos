const SHEET_URL = "https://script.google.com/macros/s/AKfycbw8tQZACY8Cv7lquZM6DYB2BatZ-YJcG3tcONM4W2UiT2o_z5ggFIoMeiW6VwlJEfm88w/exec";

// Enviar un registro a Google Sheets
function enviarASheet(registro) {
  return fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(registro),
    headers: { "Content-Type": "application/json" }
  });
}

// Guardar en localStorage como pendiente
function guardarPendiente(registro) {
  let pendientes = JSON.parse(localStorage.getItem("pendientes") || "[]");
  pendientes.push(registro);
  localStorage.setItem("pendientes", JSON.stringify(pendientes));
}

// Sincronizar pendientes cuando hay internet
function sincronizarPendientes() {
  let pendientes = JSON.parse(localStorage.getItem("pendientes") || "[]");
  if (pendientes.length === 0) return;

  let restantes = [];
  let promesas = pendientes.map(registro =>
    enviarASheet(registro)
      .then(res => {
        if (!res.ok) restantes.push(registro);
      })
      .catch(() => restantes.push(registro))
  );

  Promise.all(promesas).then(() => {
    localStorage.setItem("pendientes", JSON.stringify(restantes));
    if (restantes.length < pendientes.length) {
      mostrarMensaje(`✅ ${pendientes.length - restantes.length} registro(s) pendiente(s) sincronizado(s)`, "verde");
    }
  });
}

// Mostrar mensaje de estado
function mostrarMensaje(texto, color) {
  let msg = document.getElementById("mensaje");
  msg.textContent = texto;
  msg.style.color = color === "verde" ? "green" : "#c0392b";
  setTimeout(() => msg.textContent = "", 4000);
}

// Al hacer clic en Guardar
document.getElementById("guardar").addEventListener("click", function () {
  let usuario  = document.getElementById("usuario").value.trim();
  let conductor = document.getElementById("conductor").value.trim();
  let documento = document.getElementById("documento").value.trim();
  let sucursal  = document.getElementById("sucursal").value.trim();
  let tipo      = document.getElementById("tipo").value;

  // Validaciones
  if (!usuario) {
    mostrarMensaje("⚠️ Selecciona un usuario", "rojo"); return;
  }
  if (!conductor) {
    mostrarMensaje("⚠️ Ingresa el conductor", "rojo"); return;
  }
  if (!documento || isNaN(documento) || documento < 0) {
    mostrarMensaje("⚠️ El documento debe ser solo números", "rojo"); return;
  }
  if (!sucursal) {
    mostrarMensaje("⚠️ Ingresa la sucursal", "rojo"); return;
  }
  if (!tipo) {
    mostrarMensaje("⚠️ Selecciona el tipo de documento", "rojo"); return;
  }

  // Fecha y hora automática
  let ahora = new Date();
  let fecha = ahora.toLocaleDateString("es-VE");
  let hora  = ahora.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

  let registro = {
    fecha,
    hora,
    usuario,
    conductor,
    documento,
    sucursal,
    tipo
  };

  if (navigator.onLine) {
    enviarASheet(registro)
      .then(res => {
        if (res.ok) {
          mostrarMensaje("✅ Guardado en Google Sheets", "verde");
        } else {
          guardarPendiente(registro);
          mostrarMensaje("⚠️ Error al enviar, guardado localmente", "rojo");
        }
      })
      .catch(() => {
        guardarPendiente(registro);
        mostrarMensaje("📴 Sin conexión, guardado localmente", "rojo");
      });
  } else {
    guardarPendiente(registro);
    mostrarMensaje("📴 Sin internet, se enviará cuando haya conexión", "rojo");
  }

  // Limpiar campos (excepto usuario)
  document.getElementById("conductor").value = "";
  document.getElementById("documento").value = "";
  document.getElementById("sucursal").value = "";
  document.getElementById("tipo").value = "";
});

// Sincronizar cuando recupera internet
window.addEventListener("online", sincronizarPendientes);

// Intentar sincronizar al abrir la app
window.addEventListener("load", sincronizarPendientes);
