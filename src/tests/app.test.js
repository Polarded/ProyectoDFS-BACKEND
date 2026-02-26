// src/tests/app.test.js
const request = require('supertest');
const app     = require('../../index');

// ─────────────────────────────────────────────────────────────
// Nota: estos tests NO requieren conexión real a Supabase.
// Verifican la capa HTTP: status codes, estructura de respuestas,
// validaciones de entrada y protección de rutas.
// ─────────────────────────────────────────────────────────────

describe('🏠 Ruta raíz', () => {
  it('GET / devuelve 200 y nombre de la app', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.app).toBe('Revesshop API');
  });
});

describe('🔐 Autenticación – validaciones de entrada', () => {
  it('POST /auth/registro con body vacío → 400', async () => {
    const res = await request(app).post('/auth/registro').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errores');
  });

  it('POST /auth/registro con email inválido → 400', async () => {
    const res = await request(app).post('/auth/registro').send({
      nombre: 'Test',
      email: 'no-es-un-email',
      password: '123456',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /auth/registro con contraseña corta → 400', async () => {
    const res = await request(app).post('/auth/registro').send({
      nombre: 'Test',
      email: 'test@test.com',
      password: '123',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /auth/login con body vacío → 400', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errores');
  });
});

describe('🛡️ Rutas protegidas – sin token', () => {
  it('GET /auth/perfil sin token → 401', async () => {
    const res = await request(app).get('/auth/perfil');
    expect(res.statusCode).toBe(401);
  });

  it('POST /productos sin token → 401', async () => {
    const res = await request(app).post('/productos').send({
      nombre: 'Pala Bull',
      marca: 'Bull Padel',
      precio: 150,
      stock: 10,
    });
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /productos/1 sin token → 401', async () => {
    const res = await request(app).delete('/productos/1');
    expect(res.statusCode).toBe(401);
  });
});

describe('🛡️ Rutas protegidas – token inválido', () => {
  it('GET /auth/perfil con token falso → 401', async () => {
    const res = await request(app)
      .get('/auth/perfil')
      .set('Authorization', 'Bearer token.falso.aqui');
    expect(res.statusCode).toBe(401);
  });

  it('POST /productos con token falso → 401', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Authorization', 'Bearer token.falso.aqui')
      .send({ nombre: 'Test', marca: 'X', precio: 10, stock: 1 });
    expect(res.statusCode).toBe(401);
  });
});

describe('📦 Productos – validaciones de entrada', () => {
  // Para testear validaciones de POST necesitamos un token de admin válido.
  // Usamos un token firmado con el JWT_SECRET de test.
  let tokenAdmin;

  beforeAll(() => {
    // Seteamos JWT_SECRET para el entorno de test
    process.env.JWT_SECRET = 'secreto_test';
    const jwt = require('jsonwebtoken');
    tokenAdmin = jwt.sign(
      { id: 'test-uuid', email: 'admin@test.com', rol: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  it('POST /productos con precio negativo → 400', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'X', marca: 'Y', precio: -5, stock: 1 });
    expect(res.statusCode).toBe(400);
  });

  it('POST /productos con stock negativo → 400', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'X', marca: 'Y', precio: 100, stock: -1 });
    expect(res.statusCode).toBe(400);
  });

  it('POST /productos con nombre vacío → 400', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: '', marca: 'Y', precio: 100, stock: 5 });
    expect(res.statusCode).toBe(400);
  });

  it('POST /productos con categoria inválida → 400', async () => {
    const res = await request(app)
      .post('/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Pala', marca: 'Bull', precio: 100, stock: 5, categoria: 'videojuegos' });
    expect(res.statusCode).toBe(400);
  });
});

describe('🔄 Divisas – API externa', () => {
  it('GET /divisas/convertir sin monto → 400', async () => {
    const res = await request(app).get('/divisas/convertir?de=USD&a=MXN');
    expect(res.statusCode).toBe(400);
  });

  it('GET /divisas/convertir con monto texto → 400', async () => {
    const res = await request(app).get('/divisas/convertir?monto=abc&de=USD&a=MXN');
    expect(res.statusCode).toBe(400);
  });
});

describe('❌ Rutas inexistentes', () => {
  it('GET /ruta-que-no-existe → 404', async () => {
    const res = await request(app).get('/ruta-que-no-existe');
    expect(res.statusCode).toBe(404);
  });
});
