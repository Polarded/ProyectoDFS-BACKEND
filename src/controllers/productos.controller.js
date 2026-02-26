// src/controllers/productos.controller.js
const supabase = require('../config/supabase');



/* ─────────────────────────────────────────────────────────────
   GET /productos
   Query params:
     page     (default 1)
     limit    (default 10, max 50)
     categoria  (palas|pelotas|ropa|calzado|accesorios)
     marca
     search   (búsqueda parcial en nombre)
   ───────────────────────────────────────────────────────────── */
const getProductos = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    let query = supabase
      .from('productos')
      .select('*', { count: 'exact' });

    // Filtros opcionales
    if (req.query.categoria) query = query.eq('categoria', req.query.categoria);
    if (req.query.marca)     query = query.ilike('marca', `%${req.query.marca}%`);
    if (req.query.search)    query = query.ilike('nombre', `%${req.query.search}%`);

    // Paginación
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      total: count,
      pagina: page,
      limit,
      totalPaginas: Math.ceil(count / limit),
      productos: data,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /productos/:id
   ───────────────────────────────────────────────────────────── */
const getProductoById = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   POST /productos  [ADMIN]
   ───────────────────────────────────────────────────────────── */
const crearProducto = async (req, res, next) => {
  try {
    const { nombre, marca, precio, stock, categoria, descripcion, imagen_url } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .insert([{ nombre, marca, precio, stock, categoria, descripcion, imagen_url }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: data });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /productos/:id  [ADMIN]
   ───────────────────────────────────────────────────────────── */
const actualizarProducto = async (req, res, next) => {
  try {
    const { nombre, marca, precio, stock, categoria, descripcion, imagen_url } = req.body;

    const { data, error } = await supabase
      .from('productos')
      .update({ nombre, marca, precio, stock, categoria, descripcion, imagen_url, updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ mensaje: 'Producto actualizado', producto: data });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /productos/:id  [ADMIN]
   ───────────────────────────────────────────────────────────── */
const eliminarProducto = async (req, res, next) => {
  try {
    const { error, data } = await supabase
      .from('productos')
      .delete()
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getProductos, getProductoById, crearProducto, actualizarProducto, eliminarProducto };
