import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";

export const getCitas = async (req, res) => {
  try {
    const citas = await Cita.find().populate("paciente", "num_documento fecha_emision motivo nombres apellidos tipo_documento");
    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener citas", error });
  }
};

export const getCitaById = async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id).populate("paciente", "num_documento fecha_emision motivo nombres apellidos tipo_documento");
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar cita", error });
  }
};

export const createCita = async (req, res) => {
  try {
    const { tipo_documento, num_documento, fecha, motivo, estado } = req.body;
    if (!tipo_documento || !num_documento) {
      return res.status(400).json({ message: "Debes ingresar tipo y número de documento del usuario" });
    }
    const pacienteObj = await Usuario.findOne({ tipo_documento, num_documento });
    if (!pacienteObj) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    const nuevaCita = new Cita({ paciente: pacienteObj._id, fecha, motivo, estado });
    await nuevaCita.save();
    res.status(201).json(nuevaCita);
  } catch (error) {
    res.status(400).json({ message: "Error al crear cita", error });
  }
};

export const updateCita = async (req, res) => {
  try {
    const cita = await Cita.findByIdAndUpdate(
      req.params.id,
      req.body,
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
