import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  motivo: {
    type: String,
    required: true,
    trim: true,
  },
  estado: {
    type: String,
    enum: ["pendiente", "confirmada", "cancelada"],
    default: "pendiente",
  },
}, { timestamps: true });

const Cita = mongoose.model("Cita", citaSchema);
export default Cita;
