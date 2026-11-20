const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  console.log("BOT START...");
  const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false, browser: ["Ubuntu","Chrome","20.0"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === 'open') console.log("BOT DAH CONNECT ✅");
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connection close, reconnect... " + shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });
  await new Promise(r => setTimeout(r, 3000));
  if (!sock.authState.creds.registered) {
    try {
      const code = await sock.requestPairingCode("60179424574");
      console.log("PAIRING CODE KAU: " + code);
      console.log("Pergi WhatsApp > Linked Devices > Link with phone number");
    } catch (e) {
      console.log("Gagal pairing: " + e.message);
    }
  }
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || !msg.key.fromMe) return;
    const from = msg.key.remoteJid;
    if (msg.message.imageMessage) await sock.sendMessage(from, { text: "Dah terima gambar ✅" });
    if (msg.message.conversation === ".menu") await sock.sendMessage(from, { text: "Hai! Menu bot:\n.menu - tunjuk menu" });
  });
}
startBot();
