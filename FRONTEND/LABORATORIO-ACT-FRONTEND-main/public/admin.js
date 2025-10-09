const tableBody = document.getElementById("user-tbody");
const btnOpenModal = document.getElementById("btn-add");
const btnCloseModal = document.getElementById("btn-cancel");
const modal = document.getElementById("modal-form");
const form = document.getElementById("form-user");
const modalTitle = document.getElementById("modal-title");
const pacienteIdInput = document.getElementById("user-id");

// --- Pacientes exclusivos (rol = paciente) ---
const pacienteTableBody = document.getElementById("paciente-tbody");
const btnOpenPacienteModal = document.getElementById("btn-add-paciente");
const btnClosePacienteModal = document.getElementById("btn-cancel-paciente");
const modalPaciente = document.getElementById("modal-form-paciente");
const formPaciente = document.getElementById("form-paciente");
const modalTitlePaciente = document.getElementById("modal-title-paciente");
const pacienteIdInput2 = document.getElementById("paciente-id");

let editandoPaciente = false;
let editando = false;

// Mostrar/Ocultar modal
btnOpenModal.addEventListener("click", () => abrirModal(false));
btnCloseModal.addEventListener("click", () => modal.classList.add("hidden"));

function abrirModal(esEdicion, paciente = null) {
  editando = esEdicion;
  modal.classList.remove("hidden");
  modalTitle.textContent = esEdicion ? "Editar Paciente" : "Nuevo Paciente";

  if (esEdicion && paciente) {
    pacienteIdInput.value = paciente._id;
    document.getElementById("tipo_documento").value = paciente.tipo_documento || "dni";
    document.getElementById("num_documento").value = paciente.num_documento || "";
    document.getElementById("email").value = paciente.email || "";
    // Permitir cambiar el rol
    const rolSelect = document.getElementById("rol");
    if (rolSelect) {
      rolSelect.value = paciente.rol || "paciente";
      rolSelect.disabled = false;
    }
    document.getElementById("estado").value = paciente.estado || "activo";
  } else {
    form.reset();
    pacienteIdInput.value = "";
    const rolSelect = document.getElementById("rol");
    if (rolSelect) {
      rolSelect.value = "paciente";
      rolSelect.disabled = false;
    }
    document.getElementById("estado").value = "activo";
  }
}

// Cargar pacientes
async function cargarPacientes() {
  try {
  // Usar endpoint correcto que devuelve todos los usuarios
  const res = await fetch("/api/pacientes");
  if (!res.ok) throw new Error("Error al obtener usuarios");
  const data = await res.json();

    tableBody.innerHTML = "";
    data.forEach((u) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.tipo_documento || ""}</td>
        <td>${u.num_documento || ""}</td>
        <td>${u.email || ""}</td>
        <td>${u.rol || ""}</td>
        <td>${u.estado || ""}</td>
        <td class="actions"></td>
      `;
      // Botón editar
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "✏️";
      btnEdit.addEventListener("click", () => abrirModal(true, u));
      // Botón eliminar
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "🗑️";
      btnDelete.addEventListener("click", () => eliminarPaciente(u._id));
      row.querySelector(".actions").appendChild(btnEdit);
      row.querySelector(".actions").appendChild(btnDelete);
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de usuarios");
  }
}

// Guardar paciente (nuevo o editado)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = {
    tipo_documento: document.getElementById("tipo_documento").value,
    num_documento: document.getElementById("num_documento").value,
    email: document.getElementById("email").value,
    password_create: document.getElementById("password_create").value,
    rol: document.getElementById("rol").value,
    estado: document.getElementById("estado").value
  };

  try {
    if (editando) {
      const id = pacienteIdInput.value;
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      if (!res.ok) throw new Error("Error al actualizar usuario");
    } else {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
      if (!res.ok) throw new Error("Error al crear usuario");
    }

    form.reset();
    modal.classList.add("hidden");
    cargarPacientes();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el usuario");
  }
});

// Eliminar paciente
async function eliminarPaciente(id) {
  if (!confirm("¿Seguro que quieres eliminar este paciente?")) return;

  try {
    const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar paciente");

    cargarPacientes();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el paciente");
  }
}

// --- Gestión de citas ---

const citaTableBody = document.getElementById("cita-tbody");
const btnOpenCitaModal = document.getElementById("btn-add-cita");
const btnCloseCitaModal = document.getElementById("btn-cancel-cita");
const modalCita = document.getElementById("modal-cita");
const formCita = document.getElementById("form-cita");
const modalCitaTitle = document.getElementById("modal-cita-title");
const citaIdInput = document.getElementById("cita-id");
const selectPaciente = document.getElementById("cita-pacienteId");
const selectMedico = document.getElementById("cita-medicoId");

let editandoCita = false;

btnOpenCitaModal && btnOpenCitaModal.addEventListener("click", () => abrirCitaModal(false));
btnCloseCitaModal && btnCloseCitaModal.addEventListener("click", () => modalCita.classList.add("hidden"));

async function poblarSelectsCita() {
  // Pacientes
  const resPac = await fetch("/api/pacientes");
  const pacientes = (await resPac.json()).filter(u => u.rol === "paciente");
  selectPaciente.innerHTML = pacientes.map(p => `<option value="${p._id}">${p.num_documento} - ${p.email}</option>`).join("");
  // Médicos
  const resMed = await fetch("/api/pacientes");
  const medicos = (await resMed.json()).filter(u => u.rol === "medico");
  selectMedico.innerHTML = medicos.map(m => `<option value="${m._id}">${m.num_documento} - ${m.email}</option>`).join("");
}

function abrirCitaModal(esEdicion, cita = null) {
  editandoCita = esEdicion;
  modalCita.classList.remove("hidden");
  modalCitaTitle.textContent = esEdicion ? "Editar Cita" : "Nueva Cita";
  poblarSelectsCita();
  if (esEdicion && cita) {
    citaIdInput.value = cita._id;
    selectPaciente.value = cita.pacienteId?._id || cita.pacienteId || "";
    selectMedico.value = cita.medicoId?._id || cita.medicoId || "";
    document.getElementById("cita-fechaHora").value = cita.fechaHora ? cita.fechaHora.slice(0,16) : "";
    document.getElementById("cita-motivo").value = cita.motivo || "";
    document.getElementById("cita-estado").value = cita.estado || "programada";
  } else {
    formCita.reset();
    citaIdInput.value = "";
    document.getElementById("cita-estado").value = "programada";
  }
}

async function cargarCitas() {
  try {
    const res = await fetch("/api/citas");
    if (!res.ok) throw new Error("Error al obtener citas");
    const data = await res.json();
    citaTableBody.innerHTML = "";
    data.forEach((c) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.pacienteId?.num_documento || ""}</td>
        <td>${c.medicoId?.num_documento || ""}</td>
        <td>${c.fechaHora ? new Date(c.fechaHora).toLocaleString() : ""}</td>
        <td>${c.motivo || ""}</td>
        <td>${c.estado || ""}</td>
        <td class="actions"></td>
      `;
      // Botón editar
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "✏️";
      btnEdit.addEventListener("click", () => abrirCitaModal(true, c));
      // Botón eliminar
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "🗑️";
      btnDelete.addEventListener("click", () => eliminarCita(c._id));
      row.querySelector(".actions").appendChild(btnEdit);
      row.querySelector(".actions").appendChild(btnDelete);
      citaTableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de citas");
  }
}

formCita && formCita.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cita = {
    pacienteId: selectPaciente.value,
    medicoId: selectMedico.value,
    fechaHora: document.getElementById("cita-fechaHora").value,
    motivo: document.getElementById("cita-motivo").value,
    estado: document.getElementById("cita-estado").value,
  };
  try {
    if (editandoCita) {
      const id = citaIdInput.value;
      const res = await fetch(`/api/citas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cita),
      });
      if (!res.ok) throw new Error("Error al actualizar cita");
    } else {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cita),
      });
      if (!res.ok) throw new Error("Error al crear cita");
    }
    formCita.reset();
    modalCita.classList.add("hidden");
    cargarCitas();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar la cita");
  }
});

async function eliminarCita(id) {
  if (!confirm("¿Seguro que quieres eliminar esta cita?")) return;
  try {
    const res = await fetch(`/api/citas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar cita");
    cargarCitas();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar la cita");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Solo mostrar gestión de citas si el usuario es admin
  const role = localStorage.getItem("role");
  if (role === "admin") {
    document.getElementById("citas-section").style.display = "block";
    cargarCitas();
  } else {
    document.getElementById("citas-section").style.display = "none";
  }
});

// Cargar al entrar

// CRUD de pacientes exclusivos (rol = paciente)
function abrirPacienteModal(esEdicion, paciente = null) {
  editandoPaciente = esEdicion;
  modalPaciente.classList.remove("hidden");
  modalTitlePaciente.textContent = esEdicion ? "Editar Paciente" : "Nuevo Paciente";
  if (esEdicion && paciente) {
    pacienteIdInput2.value = paciente._id;
    document.getElementById("paciente-tipo_documento").value = paciente.tipo_documento || "dni";
    document.getElementById("paciente-num_documento").value = paciente.num_documento || "";
    document.getElementById("paciente-email").value = paciente.email || "";
    document.getElementById("paciente-password_create").value = "";
    document.getElementById("paciente-estado").value = paciente.estado || "activo";
  } else {
    formPaciente.reset();
    pacienteIdInput2.value = "";
    document.getElementById("paciente-estado").value = "activo";
  }
}

async function cargarPacientesSolo() {
  try {
    const res = await fetch("/api/pacientes");
    if (!res.ok) throw new Error("Error al obtener pacientes");
    const data = await res.json();
    const soloPacientes = data.filter(u => u.rol === "paciente");
    pacienteTableBody.innerHTML = "";
    soloPacientes.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.tipo_documento || ""}</td>
        <td>${p.num_documento || ""}</td>
        <td>${p.email || ""}</td>
        <td>${p.estado || ""}</td>
        <td class="actions"></td>
      `;
      // Botón editar
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "✏️";
      btnEdit.addEventListener("click", () => abrirPacienteModal(true, p));
      // Botón eliminar
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "🗑️";
      btnDelete.addEventListener("click", () => eliminarPacienteSolo(p._id));
      row.querySelector(".actions").appendChild(btnEdit);
      row.querySelector(".actions").appendChild(btnDelete);
      pacienteTableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de pacientes");
  }
}

formPaciente && formPaciente.addEventListener("submit", async (e) => {
  e.preventDefault();
  const paciente = {
    tipo_documento: document.getElementById("paciente-tipo_documento").value,
    num_documento: document.getElementById("paciente-num_documento").value,
    email: document.getElementById("paciente-email").value,
    password_create: document.getElementById("paciente-password_create").value,
    rol: "paciente",
    estado: document.getElementById("paciente-estado").value
  };
  try {
    if (editandoPaciente) {
      const id = pacienteIdInput2.value;
      const res = await fetch(`/api/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paciente),
      });
      if (!res.ok) throw new Error("Error al actualizar paciente");
    } else {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paciente),
      });
      if (!res.ok) throw new Error("Error al crear paciente");
    }
    formPaciente.reset();
    modalPaciente.classList.add("hidden");
    cargarPacientesSolo();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el paciente");
  }
});

async function eliminarPacienteSolo(id) {
  if (!confirm("¿Seguro que quieres eliminar este paciente?")) return;
  try {
    const res = await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar paciente");
    cargarPacientesSolo();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar el paciente");
  }
}

btnOpenPacienteModal && btnOpenPacienteModal.addEventListener("click", () => abrirPacienteModal(false));
btnClosePacienteModal && btnClosePacienteModal.addEventListener("click", () => modalPaciente.classList.add("hidden"));

document.addEventListener("DOMContentLoaded", () => {
  cargarPacientes();
  cargarPacientesSolo();
});
