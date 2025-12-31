// routes/protected.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware para verificar token y suscripción
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isSubscribed) {
      return res.status(403).json({ message: 'Acceso denegado: requiere suscripción activa' });
    }

    req.user = decoded; // Adjuntamos los datos del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Ruta protegida para contenido de Desarrollo Personal
router.get('/categoria-desarrollo-personal', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Acceso concedido a contenido premium de Desarrollo Personal',
    user: req.user,
  });
});

module.exports = router;

// routes/protected.js
const express = require('express');
const verifyToken = require('../middleware/verifyToken'); // Importación
const router = express.Router();

router.get('/categoria-desarrollo-personal', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'Acceso concedido a contenido premium',
    user: req.user, // Información del usuario autenticado
  });
});

module.exports = router;
