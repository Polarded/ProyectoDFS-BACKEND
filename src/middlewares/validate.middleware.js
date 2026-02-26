// src/middleware/validate.middleware.js
const { body, validationResult } = require('express-validator');

/**
 * Ejecuta las reglas y si hay errores devuelve 400
 */
const validar = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  next();
};

/* ── Reglas para productos ─────────────────────────────────── */
const reglasProducto = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 120 }).withMessage('Nombre máximo 120 caracteres'),
  body('marca')
    .notEmpty().withMessage('La marca es obligatoria'),
  body('precio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser mayor que 0'),
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock no puede ser negativo'),
  body('categoria')
    .optional()
    .isIn(['palas', 'pelotas', 'ropa', 'calzado', 'accesorios'])
    .withMessage('Categoría inválida'),
  validar,
];

/* ── Reglas para registro de usuario ──────────────────────── */
const reglasRegistro = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  validar,
];

/* ── Reglas para login ─────────────────────────────────────── */
const reglasLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  validar,
];

module.exports = { reglasProducto, reglasRegistro, reglasLogin };
