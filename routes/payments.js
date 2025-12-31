// routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user');
const bodyParser = require('body-parser');

// 1️⃣ CREAR SESIÓN DE PAGO CON STRIPE
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email requerido para crear la sesión' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Membresía Premium AudiolibrosCo',
            },
            unit_amount: 1290, // 💲$12.90 en centavos
          },
          quantity: 1,
        },
      ],
      success_url: 'https://audiolibrosco.com/registre.html?paid=true',
      cancel_url: 'https://audiolibrosco.com/index.html',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error.message);
    res.status(500).json({ message: 'Error al crear sesión de pago' });
  }
});

// 2️⃣ WEBHOOK DE STRIPE - ACTUALIZA isSubscribed EN MongoDB
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Solo procesar el evento si es pago exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;

    try {
      const user = await User.findOne({ email: customerEmail });
      if (user) {
        user.isSubscribed = true;
        await user.save();
        console.log(`✅ Usuario actualizado: ${customerEmail}`);
      } else {
        console.log(`⚠️ Usuario con email ${customerEmail} no encontrado (se registrará después).`);
      }
    } catch (err) {
      console.error('❌ Error actualizando usuario:', err);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;
