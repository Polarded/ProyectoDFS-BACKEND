// src/index.js  –  Revesshop Backend
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./src/routes/auth.routes');
const productosRoutes = require('./src/routes/productos.routes');
const divisasRoutes   = require('./src/routes/divisas.routes');
const { errorHandler } = require('./src/middlewares/error.middleware');

const app  = express();
const PORT = process.env.PORT || 3000;


// ── Middleware global ─────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Logger básico ─────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Rutas ─────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('API OK');
  
});

app.use('/auth',      authRoutes);
app.use('/productos', productosRoutes);
app.use('/divisas',   divisasRoutes);

// ── 404 catch-all ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Manejador centralizado de errores ─────────────────────────
app.use(errorHandler);

// ── Arranque ──────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Reveshop corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app; // exportado para tests
