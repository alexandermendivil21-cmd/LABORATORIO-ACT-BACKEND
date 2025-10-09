// controllers/paciente.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Usuario from "../models/Usuario.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getPacientes = async (req, res) => {
  try {
    // Mostrar todos los usuarios (sin filtro de rol)
    const usuarios = await Usuario.find({});
    const resultado = usuarios.map(u => ({
      _id: u._id,
      tipo_documento: u.tipo_documento,
      num_documento: u.num_documento,
      email: u.email,
      rol: u.rol,
      estado: u.estado,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
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
    const { tipo_documento, num_documento, email, password_create } = req.body;
    if (!tipo_documento || !num_documento || !email || !password_create) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    // Verificar si el email ya existe
    const existeEmail = await Usuario.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }
    // Verificar si el documento ya existe
    const existeDoc = await Usuario.findOne({ tipo_documento, num_documento });
    if (existeDoc) {
      return res.status(400).json({ message: "El documento ya está registrado" });
    }
    // Hashear contraseña
    const bcryptjs = await import('bcryptjs');
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password_create, salt);
    const nuevoPaciente = new Usuario({
      tipo_documento,
      num_documento,
      email,
      password_create: hash,
      rol: "paciente",
      estado: "activo"
    });
    await nuevoPaciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(400).json({ message: "Error al crear paciente", error });
  }
};

// --- Actualizar un paciente ---
export const updatePaciente = async (req, res) => {
  try {
    const { tipo_documento, num_documento, email, password_create, estado, rol } = req.body;
    const updateData = {};
    if (tipo_documento) updateData.tipo_documento = tipo_documento;
    if (num_documento) updateData.num_documento = num_documento;
    if (email) updateData.email = email;
    if (typeof estado !== 'undefined') updateData.estado = estado;
    if (rol) updateData.rol = rol;
    if (password_create) {
      const bcryptjs = await import('bcryptjs');
      const salt = await bcryptjs.genSalt(10);
      updateData.password_create = await bcryptjs.hash(password_create, salt);
    }
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar usuario", error });
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