// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isSubscribed) {
      return res.status(403).json({ message: 'Acceso denegado: se requiere suscripción activa' });
    }

    req.user = decoded; // Guardamos info del token para otras rutas si es necesario
    next(); // continúa con la siguiente función o ruta
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = verifyToken;

// ejemplo en backend (routes/protected.js)
router.get("/validate-subscription", verifyToken, (req, res) => {
  if (req.user && req.user.isSubscribed) {
    res.status(200).json({ message: "Acceso autorizado" });
  } else {
    res.status(403).json({ message: "Suscripción requerida" });
  }
});
