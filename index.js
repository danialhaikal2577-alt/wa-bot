const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session');
  console.log("BOT START...");
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'info' }), browser: ['Chrome', 'Chrome', '1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.qr) qrcode.generate(u.qr, { small: true });
    if (u.connection === 'open') console.log("BOT DAH ONLINE!");
  });
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (msg.message.imageMessage) {
      await sock.sendMessage(from, { text: "Dah dapat gambar kau! Nanti aku HD kan." });
    }
    if (msg.message.conversation === ".menu") {
      await sock.sendMessage(from, { text: "Hantar gambar, aku akan HD kan!" });
    }
  });
}
startBot();

