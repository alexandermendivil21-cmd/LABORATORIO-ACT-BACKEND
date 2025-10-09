// controllers/authentication.controller.js
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Usuario from "../models/Usuario.js"; // 👈 importa el modelo

dotenv.config();

/** REGISTER **/
export async function register(req, res) {
  try {
    const {
      tipo_documento,
      num_documento,
      email,
      password_create,
    } = req.body;

    if (!tipo_documento || !num_documento || !email || !password_create) {
      return res.status(400).json({ ok: false, message: "Faltan campos obligatorios." });
    }

    if (!["dni", "pasaporte", "carnet-ext"].includes(tipo_documento)) {
      return res.status(400).json({ ok: false, message: "Tipo de documento inválido." });
    }

    // Verificar si ya existe en BD
    const existe = await Usuario.findOne({ $or: [ { tipo_documento, num_documento }, { email } ] });
    if (existe) {
      return res.status(400).json({ ok: false, message: "Usuario o correo ya registrado." });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password_create, salt);

    await Usuario.create({
      tipo_documento,
      num_documento,
      email,
      password_create: hash,
      rol: "paciente",
      estado: "activo",
    });

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado con éxito.",
      redirect: "/login",
    });
  } catch (err) {
    console.error("Error en register:", err);
    return res.status(500).json({ ok: false, message: "Error interno." });
  }
}

/** LOGIN **/
export async function login(req, res) {
  try {
    const { tipo_documento, num_documento, password_create } = req.body;
    if (!tipo_documento || !num_documento || !password_create) {
      return res.status(400).json({ ok: false, message: "Faltan campos." });
    }

    // Admin hardcodeado
    if (tipo_documento === "dni" && num_documento === "73066688" && password_create === "admin123") {
      const token = jwt.sign(
        { tipo_documento, num_documento, rol: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      return res.status(200).json({
        ok: true,
        message: "Login exitoso como ADMIN.",
        token,
        rol: "admin",
        redirect: "/admin",
      });
    }

    // Buscar usuario en MongoDB
    const user = await Usuario.findOne({ tipo_documento, num_documento });
    if (!user) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
    }

    const match = await bcryptjs.compare(password_create, user.password_create);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta." });
    }

    // Redirigir según rol
    let rol = user.rol || "paciente";
    let redirect = rol === "admin" ? "/admin" : "/user";
    const token = jwt.sign(
      { tipo_documento, num_documento, rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      ok: true,
      message: "Login exitoso.",
      token,
      rol,
      redirect,
    });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ ok: false, message: "Error interno." });
  }
}

/** CHANGE PASSWORD **/
export async function password(req, res) {
  try {
    const { current_password, new_password, repeat_password } = req.body;

    if (!current_password || !new_password || !repeat_password) {
      return res.status(400).json({ ok: false, message: "Faltan campos." });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ ok: false, message: "Mínimo 8 caracteres." });
    }

    if (new_password !== repeat_password) {
      return res.status(400).json({ ok: false, message: "Las contraseñas no coinciden." });
    }

    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, message: "Token faltante." });
    }

    let payload;
    try {
      payload = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ ok: false, message: "Token inválido o expirado." });
    }

    // 🔍 Buscar usuario en BD
    const user = await Usuario.findOne({
      tipo_documento: payload.tipo_documento,
      num_documento: payload.num_documento,
    });

    if (!user) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
    }

    const match = await bcryptjs.compare(current_password, user.password_create);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Contraseña actual incorrecta." });
    }

    const salt = await bcryptjs.genSalt(5);
    user.password_create = await bcryptjs.hash(new_password, salt);

    // Guardar cambios
    await user.save();

    const newToken = jwt.sign(
      { tipo_documento: user.tipo_documento, num_documento: user.num_documento },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      ok: true,
      message: "Contraseña actualizada con éxito.",
      token: newToken,
      redirect: "/login",
    });
  } catch (err) {
    console.error("Error en password():", err);
    return res.status(500).json({ ok: false, message: "Error interno." });
  }
}

export const methods = { register, login, password };
