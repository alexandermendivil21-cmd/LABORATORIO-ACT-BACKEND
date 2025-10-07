const tableBody = document.getElementById("user-tbody"); // correcto
const btnOpenModal = document.getElementById("btn-add"); // correcto
const btnCloseModal = document.getElementById("btn-cancel"); // correcto
const modal = document.getElementById("modal-form"); // correcto
const form = document.getElementById("form-user"); // correcto
const modalTitle = document.getElementById("modal-title"); // correcto
const pacienteIdInput = document.getElementById("user-id"); // correcto

let editando = false;

// Mostrar/Ocultar modal
btnOpenModal.addEventListener("click", () => abrirModal(false));
btnCloseModal.addEventListener("click", () => modal.classList.add("hidden"));

function abrirModal(esEdicion, paciente = null) {
  editando = esEdicion;
  modal.classList.remove("hidden");
  modalTitle.textContent = esEdicion ? "Editar Paciente" : "Nuevo Paciente";

  if (esEdicion && paciente) {
    pacienteIdInput.value = paciente._id; // usar _id de MongoDB
    document.getElementById("correo").value = paciente.correo || "";
    document.getElementById("first-name").value = paciente.nombres;
    document.getElementById("last-name").value = paciente.apellidos;
    document.getElementById("age").value = paciente.edad;
    document.getElementById("gender").value = paciente.genero;
    document.getElementById("address").value = paciente.direccion;
    document.getElementById("phone").value = paciente.celular;
    document.getElementById("tipo_usuario").value = paciente.tipo_usuario || "paciente";
  } else {
    form.reset();
    pacienteIdInput.value = "";
    document.getElementById("tipo_usuario").value = "paciente";
  }
}

// Cargar pacientes
async function cargarPacientes() {
  try {
    const res = await fetch("/api/pacientes");
    if (!res.ok) throw new Error("Error al obtener pacientes");
    const data = await res.json();

    tableBody.innerHTML = "";
    data.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.nombres}</td>
        <td>${p.apellidos}</td>
        <td>${p.edad}</td>
        <td>${p.genero}</td>
        <td>${p.direccion}</td>
        <td>${p.celular}</td>
        <td class="actions"></td>
      `;

      // Botón editar
      const btnEdit = document.createElement("button");
      btnEdit.textContent = "✏️";
      btnEdit.addEventListener("click", () => abrirModal(true, p));

      // Botón eliminar
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "🗑️";
      btnDelete.addEventListener("click", () => eliminarPaciente(p._id)); // usar _id

      row.querySelector(".actions").appendChild(btnEdit);
      row.querySelector(".actions").appendChild(btnDelete);

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert("No se pudo cargar la lista de pacientes");
  }
}

// Guardar paciente (nuevo o editado)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const paciente = {
    correo: document.getElementById("correo").value,
    nombres: document.getElementById("first-name").value,
    apellidos: document.getElementById("last-name").value,
    edad: parseInt(document.getElementById("age").value),
    genero: document.getElementById("gender").value,
    direccion: document.getElementById("address").value,
    celular: document.getElementById("phone").value,
    tipo_documento: document.getElementById("tipo_documento").value,
    num_documento: document.getElementById("num_documento").value,
    fecha_emision: document.getElementById("fecha_emision").value,
    password_create: document.getElementById("password_create").value,
    mayor: document.getElementById("mayor").checked,
    menor: document.getElementById("menor").checked,
    tipo_usuario: document.getElementById("tipo_usuario").value,
  };

  try {
    if (editando) {
      const id = pacienteIdInput.value; // contiene _id
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

    form.reset();
    modal.classList.add("hidden");
    cargarPacientes();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el paciente");
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

let editandoCita = false;

if (btnOpenCitaModal && btnCloseCitaModal && modalCita && formCita) {
  btnOpenCitaModal.addEventListener("click", () => abrirCitaModal(false));
  btnCloseCitaModal.addEventListener("click", () => modalCita.classList.add("hidden"));
}

function abrirCitaModal(esEdicion, cita = null) {
  editandoCita = esEdicion;
  modalCita.classList.remove("hidden");
  modalCitaTitle.textContent = esEdicion ? "Editar Cita" : "Nueva Cita";
  if (esEdicion && cita) {
    citaIdInput.value = cita._id;
    document.getElementById("cita-tipo-documento").value = cita.paciente.tipo_documento || "";
    document.getElementById("cita-num-documento").value = cita.paciente.num_documento || "";
    document.getElementById("cita-fecha").value = cita.fecha.slice(0,16);
    document.getElementById("cita-motivo").value = cita.motivo;
    document.getElementById("cita-estado").value = cita.estado;
  } else {
    formCita.reset();
    citaIdInput.value = "";
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
        <td>${c.paciente.num_documento}</td>
        <td>${new Date(c.fecha).toLocaleString()}</td>
        <td>${c.motivo}</td>
        <td>${c.estado}</td>
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
  // Obtener datos del formulario
  const tipo_documento = document.getElementById("cita-tipo-documento").value;
  const num_documento = document.getElementById("cita-num-documento").value.trim();
  const fecha = document.getElementById("cita-fecha").value;
  const motivo = document.getElementById("cita-motivo").value;
  const estado = document.getElementById("cita-estado").value;
  if (!tipo_documento || !num_documento) {
    alert("Debes ingresar el tipo y número de documento del paciente");
    return;
  }
  const cita = {
    tipo_documento,
    num_documento,
    fecha,
    motivo,
    estado,
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
document.addEventListener("DOMContentLoaded", cargarPacientes);
