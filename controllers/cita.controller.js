import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";

export const getCitas = async (req, res) => {
  try {
    const citas = await Cita.find()
      .populate("pacienteId", "num_documento tipo_documento email")
      .populate("medicoId", "num_documento tipo_documento email");
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas", error });
  }
};

export const getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id)
      .populate("pacienteId", "num_documento tipo_documento email")
      .populate("medicoId", "num_documento tipo_documento email");
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar cita", error });
  }
};

export const createCita = async (req, res) => {
  try {
    const { pacienteId, medicoId, fechaHora, motivo, estado } = req.body;
    if (!pacienteId || !medicoId || !fechaHora || !motivo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    // Validar pacienteId
    const paciente = await Usuario.findById(pacienteId);
    if (!paciente || paciente.rol !== "paciente") {
      return res.status(400).json({ message: "El pacienteId no corresponde a un usuario con rol 'paciente'" });
    }
    // Validar medicoId
    const medico = await Usuario.findById(medicoId);
    if (!medico || medico.rol !== "medico") {
      return res.status(400).json({ message: "El medicoId no corresponde a un usuario con rol 'medico'" });
    }
    const nuevaCita = new Cita({
      pacienteId,
      medicoId,
      fechaHora,
      motivo,
      estado: estado || "programada"
    });
    await nuevaCita.save();
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(400).json({ message: "Error al crear cita", error });
  }
};

export const updateCita = async (req, res) => {
  try {
    const { pacienteId, medicoId, fechaHora, motivo, estado } = req.body;
    const updateData = {};
    if (pacienteId) {
      const paciente = await Usuario.findById(pacienteId);
      if (!paciente || paciente.rol !== "paciente") {
        return res.status(400).json({ message: "El pacienteId no corresponde a un usuario con rol 'paciente'" });
      }
      updateData.pacienteId = pacienteId;
    }
    if (medicoId) {
      const medico = await Usuario.findById(medicoId);
      if (!medico || medico.rol !== "medico") {
        return res.status(400).json({ message: "El medicoId no corresponde a un usuario con rol 'medico'" });
      }
      updateData.medicoId = medicoId;
    }
    if (fechaHora) updateData.fechaHora = fechaHora;
    if (motivo) updateData.motivo = motivo;
    if (estado) updateData.estado = estado;
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
    res.json(cita);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar cita", error });
  }
};

export const deleteCita = async (req, res) => {
  try {
    const cita = await Cita.findByIdAndDelete(req.params.id);
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar cita", error });
  }
};
