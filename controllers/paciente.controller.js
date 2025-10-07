// controllers/paciente.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Usuario from "../models/Usuario.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getPacientes = async (req, res) => {
  try {
    const pacientes = await Usuario.find();
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pacientes", error });
  }
};

// --- Obtener un paciente por ID ---
export const getPacienteById = async (req, res) => {
  try {
    const paciente = await Usuario.findById(req.params.id);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar paciente", error });
  }
};

// --- Crear un paciente ---
export const createPaciente = async (req, res) => {
  try {
    const nuevoPaciente = new Usuario(req.body);
    await nuevoPaciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(400).json({ message: "Error al crear paciente", error });
  }
};

// --- Actualizar un paciente ---
export const updatePaciente = async (req, res) => {
  try {
    const paciente = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json(paciente);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar paciente", error });
  }
};

// --- Eliminar un paciente ---
export const deletePaciente = async (req, res) => {
  try {
    const paciente = await Usuario.findByIdAndDelete(req.params.id);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    res.json({ message: "Paciente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar paciente", error });
  }
};