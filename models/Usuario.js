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
      unique: true, // cada documento debe ser único
      trim: true,
    },
    fecha_emision: {
      type: Date,
      required: true,
    },
    password_create: {
      type: String,
      required: true,
    },
    mayor: {
      type: Boolean,
      default: false,
    },
    menor: {
      type: Boolean,
      default: false,
    },
    tipo_usuario: {
      type: String,
      enum: ["paciente", "admin"],
      default: "paciente",
      required: true,
    },
    // Campos agregados desde Users.js
    nombres: {
      type: String,
      required: true,
      trim: true,
    },
    apellidos: {
      type: String,
      required: true,
      trim: true,
    },
    edad: {
      type: Number,
      required: true,
      min: 0,
    },
    genero: {
      type: String,
      enum: ["Masculino", "Femenino", "Otro"],
      required: true,
    },
    direccion: {
      type: String,
      required: true,
    },
    celular: {
      type: String,
      required: true,
      match: /^[0-9]{9}$/,
    },
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
