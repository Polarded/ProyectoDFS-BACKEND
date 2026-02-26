// src/routes/divisas.routes.js
const express = require('express');
const router  = express.Router();

const { getTasas, convertir } = require('../controllers/divisas.controller');

// GET /divisas/tasas          – pública
router.get('/tasas', getTasas);

// GET /divisas/convertir?monto=100&de=USD&a=MXN  – pública
router.get('/convertir', convertir);

module.exports = router;
