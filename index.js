const {
  default: makeWASocket, useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");

const baca = readline.createInterface({input: process.stdin, output: process.stdout});
const rikybot = process.argv.includes("--RikyBOT");

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("riky");
  const riky = makeWASocket({
    printQRInTerminal: !rikybot,
    auth: state,
    broswer: rikybot ? ["RikyBOT", "Firefox", "1.0.0"] : ["Riky Ripaldo", "Safari", "1.0.0"],
    logger: pino({ level: "silent" })
  });

  if (rikybot && !riky.authState.creds.registered) {
    const pertanyaan = (tanya) => new Promise(async (resolve) => {
      baca.question(tanya, (jawaban) => {
        resolve(jawaban);
        baca.close();
      });
    });
    const nomor = await pertanyaan("Masukkan nomor WhatsApp : ");
    setTimeout(async function() {
      const codes = await riky.requestPairingCode(nomor);
      console.log(`Pairing Kode Anda : ${codes}`);
    }, 3000);
  }

  riky.ev.on("creds.update", saveCreds);
  riky.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      console.log("Koneksi terputus, mencoba menghubungkan kembali...");
      await connectToWhatsApp();
    } else if (connection === "open") {
      console.log("Koneksi terhubung ke nomor " + riky.user.id.split(":")[0]);
    }
  });

  riky.ev.on("messages.upsert", async ({pesan}) => {
    const chat = pesan.messages[0];
    console.log(chat);
    function reply(text) {
      riky.sendMessage(chat.key.remoteJid, {text: text}, {quoted: chat});
    }
    if (chat.message.conversation.toLowercase() === "ping") {
      reply("pong");
    }
  });
}

connectToWhatsApp();
