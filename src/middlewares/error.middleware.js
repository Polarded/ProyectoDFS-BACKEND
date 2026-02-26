// src/middleware/error.middleware.js

/**
 * Middleware centralizado de manejo de errores.
 * Debe registrarse DESPUÉS de todas las rutas en index.js
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Error de validación de express-validator (lo lanzamos nosotros con status 400)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error genérico
  return res.status(500).json({ error: 'Error interno del servidor' });
};

/**
 * Helper: crea un error con código HTTP
 */
const crearError = (message, statusCode = 500) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, crearError };
