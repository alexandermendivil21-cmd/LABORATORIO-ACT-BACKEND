// public/login.js

const mensajeError = document.getElementById("msg");
const form = document.getElementById("loginForm");

// Cargar datos guardados al iniciar la página
window.addEventListener("DOMContentLoaded", () => {
  const recordar = localStorage.getItem("recordar");
  
  if (recordar === "true") {
    const tipoDoc = localStorage.getItem("tipo_documento");
    const numDoc = localStorage.getItem("num_documento");
    
    if (tipoDoc) {
      form.elements["tipo-documento"].value = tipoDoc;
    }
    if (numDoc) {
      form.elements["num-documento"].value = numDoc;
    }
    form.elements["remember"].checked = true;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const elems = form.elements;
  const payload = {
    tipo_documento: elems["tipo_documento"].value,
    num_documento:   elems["num_documento"].value,
    password:        elems["password"].value
  };

  try {
    const res = await fetch("/api/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      mensajeError.textContent = data.message || "Error al iniciar sesión.";
      mensajeError.style.color = "red";
      return;
    }

    // Guardar token y rol en localStorage
    if (data.token) localStorage.setItem('token', data.token);
    if (data.role) localStorage.setItem('role', data.role);

    // Redirigir siempre a user.html
  window.location.href = '/user';
    // Guardar token para llamadas autenticadas posteriores
    localStorage.setItem("token", data.token);

    // Redirigir al área admin
    window.location.href = data.redirect || "/admin";
  } catch (err) {
    console.error("Error en fetch:", err);
    mensajeError.textContent = "No se pudo conectar al servidor.";
    mensajeError.classList.remove("escondido");
  }
});