const { 
  default: makeWASocket, 
  useMultiFileAuthState 
} = require('@whiskeysockets/baileys')

const RikyBOT = process.argv.includes('--RikyBOT')

const KyBOT = async() => {
  const riky = async makeWASocket({
   printQRCodeTerminal: !RikyBOT 
  })
}

KyBOT()