const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Pour servir index.html

// SECRETS - Ils viennent de Render, jamais écrits en dur
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Route pour les retraits
app.post('/api/retrait', async (req, res) => {
  const { methode, numero, montant } = req.body;

  // Vérifications de base
  if (!numero || numero.length < 8) {
    return res.json({ ok: false, message: "Numéro invalide" });
  }
  if (!montant || parseInt(montant) < 1000) {
    return res.json({ ok: false, message: "Minimum 1000 FCFA" });
  }

  // Vérifie que le bot est configuré sur Render
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("ERREUR: Variables TELEGRAM manquantes sur Render");
    return res.json({ ok: false, message: "Serveur non configuré" });
  }

  // Message qui part dans son bot Telegram
  const message = `🔔 NOUVELLE DEMANDE BLUE CASH

💳 Méthode: ${methode}
📱 Numéro: ${numero}
💰 Montant: ${montant} FCFA

ID: #${Date.now().toString().slice(-5)}
Heure: ${new Date().toLocaleString('fr-FR')}`;

  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;

  try {
    const response = await fetch(telegramUrl);
    const data = await response.json();
    
    if (data.ok) {
      res.json({ ok: true });
    } else {
      console.log("Erreur Telegram:", data);
      res.json({ ok: false, message: "Erreur Telegram" });
    }
  } catch (error) {
    console.log(error);
    res.json({ ok: false, message: "Erreur serveur" });
  }
});

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Blue Cash en ligne sur port ${PORT}`);
});