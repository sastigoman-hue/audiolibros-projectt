// routes/authGoogle.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Iniciar login con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback después del login con Google
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html',
    session: true
  }),
  (req, res) => {
    // Éxito → Redirigir según si está suscrito
    if (req.user.isSubscribed) {
      res.redirect('/Categorias.html');
    } else {
      res.redirect('/planes.html');
    }
  }
);

module.exports = router;
