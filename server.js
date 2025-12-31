// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Rutas y passport config
require('./middleware/passportConfig');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const paymentRoutes = require('./routes/payments');
const authGoogleRoutes = require('./routes/authGoogle');

const app = express();

// Stripe webhook: SOLO usar express.raw en esta ruta
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

// Demás middlewares
app.use(cors());
app.use(express.json());

// Express-session (⚠️ antes de passport)
app.use(session({
  secret: process.env.JWT_SECRET || 'clave_segura',
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport y sesiones
app.use(passport.initialize());
app.use(passport.session());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/audiolibros', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((err) => {
  console.error('❌ Error conectando a MongoDB:', err);
});

// Rutas
app.use('/api', authRoutes);
app.use('/api', protectedRoutes);
app.use('/stripe', paymentRoutes);
app.use('/auth', authGoogleRoutes); // <--- RUTA DE GOOGLE LOGIN

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
});
