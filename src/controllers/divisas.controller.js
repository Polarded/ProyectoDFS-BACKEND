// src/controllers/divisas.controller.js
// API Externa: ExchangeRate Open API  →  https://open.er-api.com (gratuita, sin key)
//
// Esta integración permite mostrar precios de productos en múltiples monedas
// en tiempo real, útil para clientes internacionales.

const axios = require('axios');

const BASE_CURRENCY  = process.env.BASE_CURRENCY  || 'USD';
const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL || 'https://open.er-api.com/v6/latest';

/**
 * GET /divisas/tasas
 * Devuelve las tasas de cambio actuales desde USD
 */
const getTasas = async (req, res, next) => {
  try {
    const url = `${EXCHANGE_API_URL}/${BASE_CURRENCY}`;
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data.result !== 'success') {
      return res.status(502).json({ error: 'No se pudieron obtener las tasas de cambio' });
    }

    const { time_last_update_utc, base_code, rates } = response.data;

    // Sólo enviamos las monedas más relevantes para una tienda de pádel
    const monedasRelevantes = ['USD', 'EUR', 'MXN', 'GBP', 'ARS', 'CLP', 'COP'];
    const tasasFiltradas = Object.fromEntries(
      Object.entries(rates).filter(([key]) => monedasRelevantes.includes(key))
    );

    res.json({
      base: base_code,
      actualizadoEn: time_last_update_utc,
      tasas: tasasFiltradas,
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return res.status(504).json({ error: 'Timeout al consultar API de divisas' });
    }
    next(err);
  }
};

/**
 * GET /divisas/convertir?monto=100&de=USD&a=MXN
 * Convierte un monto entre dos monedas
 */
const convertir = async (req, res, next) => {
  try {
    const { monto, de = 'USD', a = 'MXN' } = req.query;

    if (!monto || isNaN(parseFloat(monto))) {
      return res.status(400).json({ error: 'El parámetro "monto" debe ser un número' });
    }

    const url = `${EXCHANGE_API_URL}/${de.toUpperCase()}`;
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data.result !== 'success') {
      return res.status(502).json({ error: 'No se pudo obtener la tasa de cambio' });
    }

    const tasa = response.data.rates[a.toUpperCase()];
    if (!tasa) {
      return res.status(400).json({ error: `Moneda destino "${a}" no soportada` });
    }

    const resultado = (parseFloat(monto) * tasa).toFixed(2);

    res.json({
      montoOriginal: parseFloat(monto),
      monedaOrigen: de.toUpperCase(),
      monedaDestino: a.toUpperCase(),
      tasa,
      resultado: parseFloat(resultado),
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout al consultar API de divisas' });
    }
    next(err);
  }
};

module.exports = { getTasas, convertir };
