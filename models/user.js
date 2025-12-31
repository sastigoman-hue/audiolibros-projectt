// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: true }, // 👈 Suscripción
  ip: { type: String } // 👈 IMPORTANTE
});

module.exports = mongoose.model('User', userSchema);
