// Scripts/mainUser.js

document.addEventListener("DOMContentLoaded", () => {
  // Recuperar usuario del localStorage
  const usuario = localStorage.getItem("usuario") || "Paciente";

  // Mostrar en el header
  document.getElementById("username").textContent = usuario;

  // Mostrar en la sección de solicitar cita
  const pacienteSpan = document.getElementById("paciente");
  if (pacienteSpan) {
    pacienteSpan.textContent = usuario;
  }

  // Botón de cerrar sesión
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("usuario");
  window.location.href = "/login";
    });
  }

  // Solicitar cita desde el panel usuario
  const solicitarBtn = document.getElementById("solicitar-cita");
  if (solicitarBtn) {
    solicitarBtn.addEventListener("click", async () => {
      // Solicitar DNI
      const dni = prompt("Ingrese su DNI:");
      if (!dni) return alert("Debes ingresar tu DNI");
      const motivo = prompt("Motivo de la cita:");
      if (!motivo) return alert("Debes ingresar un motivo");
      const fecha = prompt("Fecha y hora (YYYY-MM-DDTHH:mm):");
      if (!fecha) return alert("Debes ingresar una fecha");
      const cita = {
        dni,
        fecha,
        motivo,
        estado: "pendiente"
      };
      try {
        const res = await fetch("/api/citas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cita)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al solicitar cita");
        alert("Cita solicitada correctamente");
        // Opcional: recargar historial
      } catch (err) {
        alert("Error: " + err.message);
      }
    });
  }
});
