import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    tipo_documento: {
      type: String,
      enum: ["dni", "pasaporte", "carnet-ext"],
      required: true,
    },
    num_documento: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/,
    },
    password_create: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      default: "paciente",
      enum: ["paciente", "admin", "recepcionista", "tecnico", "medico"],
      required: true,
    },
    estado: {
      type: String,
      default: "activo",
      enum: ["activo", "inactivo"],
    },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
