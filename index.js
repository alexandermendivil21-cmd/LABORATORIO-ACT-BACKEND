import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { methods as authentication } from './controllers/authentication.controller.js';
import pacienteRoutes from "./Routes/pacientes.routes.js";
import connectDB from './Config/mongodb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('port', 5000);

// Configuración
app.use(express.json());
app.use(express.static(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main'))); // sirve CSS, JS, imágenes



connectDB(); // Conectarse a la BD antesd e que ejecute el servidor


// Rutas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'register.html')));
app.get('/password', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'password.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'admin.html')));
app.get('/user', (req, res) => res.sendFile(path.join(__dirname, 'FRONTEND', 'LABORATORIO-ACT-FRONTEND-main', 'user.html')));

// Rutas API
app.post('/api/register', authentication.register);
app.post('/api/login', authentication.login);
app.post('/api/password', authentication.password);

app.use("/api", pacienteRoutes);
// Servidor
app.listen(app.get('port'), () => {
   console.log(`🚀 Servidor corriendo en http://localhost:5000`);
});
