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
      tipo_documento: rawTipo,
      num_documento,
      fecha_emision,
      password_create,
      mayor,
      menor,
      nombres,
      apellidos,
      edad,
      genero,
      direccion,
      celular,
      correo,
    } = req.body;

    if (!rawTipo || !num_documento || !fecha_emision || !password_create || !nombres || !apellidos || !edad || !genero || !direccion || !celular || !correo) {
      return res.status(400).json({ ok: false, message: "Faltan campos obligatorios." });
    }

    const tipo = rawTipo.toLowerCase();
    if (!["dni", "pasaporte", "carnet-ext"].includes(tipo)) {
      return res.status(400).json({ ok: false, message: "Tipo de documento inválido." });
    }

    if (
      !/^\d+$/.test(num_documento) ||
      ((tipo === "dni" || tipo === "pasaporte") && num_documento.length !== 8) ||
      (tipo === "carnet-ext" && num_documento.length !== 9)
    ) {
      return res.status(400).json({ ok: false, message: "Número de documento inválido." });
    }

    const fecha = new Date(fecha_emision);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (isNaN(fecha) || fecha >= hoy) {
      return res.status(400).json({ ok: false, message: "Fecha de emisión inválida." });
    }

    if ((mayor && menor) || (!mayor && !menor)) {
      return res.status(400).json({ ok: false, message: "Marca mayor o menor (solo una)." });
    }

    // 🔍 Verificar si ya existe en BD
    const existe = await Usuario.findOne({ $or: [ { tipo_documento: tipo, num_documento }, { correo } ] });
    if (existe) {
      return res.status(400).json({ ok: false, message: "Usuario o correo ya registrado." });
    }

    const salt = await bcryptjs.genSalt(5);
    const hash = await bcryptjs.hash(password_create, salt);

    // Guardar en MongoDB
    await Usuario.create({
      tipo_documento: tipo,
      num_documento,
      fecha_emision: fecha,
      password_create: hash,
      mayor,
      menor,
      tipo_usuario: "paciente",
      nombres,
      apellidos,
      edad,
      genero,
      direccion,
      celular,
      correo,
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
    const { tipo_documento, num_documento, password } = req.body;
    if (!tipo_documento || !num_documento || !password) {
      return res.status(400).json({ ok: false, message: "Faltan campos." });
    }

    const tipo = tipo_documento.toLowerCase();

    // Admin hardcodeado
    if (tipo === "dni" && num_documento === "73066688" && password === "admin123") {
      const token = jwt.sign(
        { tipo_documento: tipo, num_documento, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        ok: true,
        message: "Login exitoso como ADMIN.",
        token,
        role: "admin",
        redirect: "/admin",
      });
    }

    // 🔍 Buscar usuario en MongoDB
    const user = await Usuario.findOne({ tipo_documento: tipo, num_documento });
    if (!user) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
    }

    const match = await bcryptjs.compare(password, user.password_create);
    if (!match) {
      return res.status(401).json({ ok: false, message: "Contraseña incorrecta." });
    }

    // Redirigir según tipo_usuario
  let role = user.tipo_usuario || "paciente";
  let redirect = role === "admin" ? "/admin" : "/user";
    const token = jwt.sign(
      { tipo_documento: tipo, num_documento, role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      ok: true,
      message: "Login exitoso.",
      token,
      role,
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
