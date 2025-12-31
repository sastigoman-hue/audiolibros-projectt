// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Validación de campos básicos
function validarCampos(name, email, password) {
  if (!name || !email || !password) {
    return 'Todos los campos son obligatorios';
  }
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailValido) {
    return 'Formato de correo electrónico inválido';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
}

// Registro de usuario con captura de IP
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Validar campos
  const error = validarCampos(name, email, password);
  if (error) return res.status(400).json({ message: error });

  try {
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      console.log(`[Registro] Usuario ya existe: ${email}`);
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = new User({
      name,
      email,
      password: hashedPassword,
      ipAddress: req.ip // 👈 Registramos la IP aquí
    });

    await nuevoUsuario.save();

    console.log(`[Registro] Usuario registrado: ${email} | IP: ${ip}`);
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('[Error Registro]', err.message);
    res.status(500).json({ message: 'Error interno al registrar el usuario' });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      console.log(`[Login] Usuario no encontrado: ${email}`);
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      console.log(`[Login] Contraseña incorrecta para: ${email}`);
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { userId: usuario._id, isSubscribed: usuario.isSubscribed },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log(`[Login] Usuario autenticado: ${email}`);
    res.json({ token });
  } catch (err) {
    console.error('[Error Login]', err.message);
    res.status(500).json({ message: 'Error interno al iniciar sesión' });
  }
});

module.exports = router;
