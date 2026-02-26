// src/routes/productos.routes.js
const express = require('express');
const router  = express.Router();

const {
  getProductos,
  getProductoById,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productos.controller');

const { verifyToken, soloAdmin }  = require('../middlewares/auth.middleware');
const { reglasProducto }          = require('../middlewares/validate.middleware');

// GET /productos?page=1&limit=10&categoria=palas&marca=Babolat&search=carbono
// Pública: cualquiera puede ver el catálogo
router.get('/', getProductos);

// GET /productos/:id  – pública
router.get('/:id', getProductoById);

// POST /productos  – solo admin
router.post('/', verifyToken, soloAdmin, reglasProducto, crearProducto);

// PUT /productos/:id  – solo admin
router.put('/:id', verifyToken, soloAdmin, reglasProducto, actualizarProducto);

// DELETE /productos/:id  – solo admin
router.delete('/:id', verifyToken, soloAdmin, eliminarProducto);

module.exports = router;
