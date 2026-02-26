// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

/**
 * POST /auth/registro
 * Crea un nuevo usuario con rol 'usuario' por defecto
 */
const registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificar si el email ya existe
    const { data: existe } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existe) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email, password_hash: hash, rol: 'usuario' }])
      .select('id, nombre, email, rol')
      .single();

    if (error) throw error;

    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: data });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/login
 * Devuelve un JWT firmado con { id, email, rol }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, password_hash, rol')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = { id: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/perfil  (ruta protegida)
 * Devuelve la info del usuario autenticado
 */
const perfil = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { registro, login, perfil };

