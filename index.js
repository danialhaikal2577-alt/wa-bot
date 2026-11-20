const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  console.log("BOT START...");
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false });

  if (!sock.authState.creds.registered) {
    try {
      const code = await sock.requestPairingCode("60179424574");
      console.log("PAIRING CODE KAU: " + code);
      console.log("Pergi WhatsApp > Linked Devices > Link with phone number, masukkan code ni");
    } catch (e) {
      console.log("Gagal pairing code: " + e.message);
    }
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u) => {
    if (u.qr) qrcode.generate(u.qr, { small: true });
    if (u.connection === 'open') console.log("BOT DAH CONNECT ✅");
    if (u.connection === 'close') console.log("Connection close, restart...");
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (msg.message.imageMessage) {
      await sock.sendMessage(from, { text: "Dah terima gambar ✅" });
    }
    if (msg.message.conversation === ".menu") {
      await sock.sendMessage(from, { text: "Hai! Menu bot:\n.menu - tunjuk menu" });
    }
  });
}
startBot();
