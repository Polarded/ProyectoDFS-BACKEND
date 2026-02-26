// src/routes/auth.routes.js
const express = require('express');
const router  = express.Router();

const { registro, login, perfil } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { reglasRegistro, reglasLogin } = require('../middlewares/validate.middleware');

// POST /auth/registro
router.post('/registro', reglasRegistro, registro);

// POST /auth/login
router.post('/login', reglasLogin, login);

// GET  /auth/perfil  ← RUTA PROTEGIDA
router.get('/perfil', verifyToken, perfil);

module.exports = router;
