/**
  * Base Ori Created By MannR
  * Name Script : Shyzu
  * Creator Script : MannR
  * Version Script : 1.0.0
  * Libary : @whiskeysockets/baileys
  * Version Libary : ^6.6.0
  * Created on Sunday, Sep 1, 2024
  * Thank you to MannR and the module providers and those who use this base.
  * Please use this base as best as possible and do not delete the copyright.
  * © MannR 2024
**/

require('./lib/config.js')
var { Boom } = require('@hapi/boom')
var { baileys, chalk, fs, pino, readline, process, PhoneNumber } = require("./lib/module")
const { default: makeConnectionShyzu, DisconnectReason, useMultiFileAuthState, makeInMemoryStore, jidDecode, generateForwardMessageContent, proto } = baileys
const CFonts = require('cfonts');

let useOfPairing = true

function question(q) {
    let y = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });
    return new Promise((resolve) => {
    y.question(q, resolve)
    });
};

let store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' })})

async function whatsappConnect() {
    let { state, saveCreds } = await useMultiFileAuthState("all/connect")
    var shyzu = makeConnectionShyzu({
    printQRInterminal: !useOfPairing,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    logger: pino({ level: "silent" }),
    auth: state
    })
    
    if (useOfPairing && !shyzu.authState.creds.registered) {
        var number = await question('input your number whatsapp:\n')
        var code = await shyzu.requestPairingCode(number.trim())
        console.log(chalk.bold.white('code:' + code))
    }
    
    shyzu.welcome = "Halo @user selamat datang"
    shyzu.leave = "Selamat tinggal @user"
    shyzu.promote = "Selamat @user dipromote"
    shyzu.demote = "Yahh @user didemote"
    
    shyzu.public = true
    
    shyzu.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode
        if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        shyzu.logout();
        } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting...."); whatsappConnect();
        } else if (reason === DisconnectReason.connectionLost) { 
        console.log("Connection Lost from Server, reconnecting..."); 
        whatsappConnect();
        } else if (reason === DisconnectReason.connectionReplaced) {
        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First")
        shyzu.logout();
        } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        shyzu.logout();
        } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required, Restarting...");
        whatsappConnect();
        } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        whatsappConnect();
        } else shyzu.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        } else if (connection === "open") { 
        CFonts.say('SHYZU', {
            font: 'simple', // Pilih salah satu font yang tersedia
            align: 'left', // Posisi teks
            colors: ['cyanBright', 'magentaBright'], // Warna teks
            background: 'transparent', // Warna background
            letterSpacing: 1, // Jarak antar huruf
            lineHeight: 2, // Tinggi baris
            space: true, // Spasi antar karakter
            maxLength: '0' // Panjang maksimal
        });
        console.log(chalk.bold.white("Simple WhatsApp bot Made by MannR")) // Hargailah yang create jangan ditempel² weem anj
        }
    console.log('Connected...', update)
    })
    
    shyzu.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m) return;
        const messageHandler = await require('./shyzu.js');
        messageHandler(shyzu, m);
    });
    
    shyzu.ev.on('group-participants.update', async (nu) => {
        console.log(nu);
        try {
        let { id, participants, action } = nu
        var metadata = await shyzu.groupMetadata(id);
        
        for (let n of participants) {
            try {
            ppser = await shyzu.profilePicture(n, 'image');
            } catch (e) {
            ppser = 'https://telegra.ph/file/68d47ac90bcc8ef1510fa.jpg';
            }
            
            switch (action) {
             case 'add':
             case 'remove': {
                var t = shyzu.welcome.replace("user", n.split("@")[0])
                var t2 = shyzu.leave.replace("user", n.split("@")[0])
                shyzu.sendMessage(id, { text: (action === 'add' ? t : t2) }, { contextInfo: { mentionedJid: [n], externalAdReply: { title: action === 'add' ? 'Welcome' : 'Goodbye', body: info.wm, thumbnailUrl: ppser, mediaType: 3, renderLargerThumbnail: false }}, mentions: [n] },{})
             }
             break;
             case 'promote': {
                var u = shyzu.promote.replace("user", n.split("@")[0])
                shyzu.sendMessage(id, { text: u }, { contextInfo: { mentionedJid: [n], externalAdReply: { title: '', body: info.wm, thumbnailUrl: ppser, mediaType: 3, renderLargerThumbnail: false }}, mentions: [n] },{})
             }
             break;
             case 'demote': {
                var x = shyzu.demote.replace("user", n.split("@")[0])
                shyzu.sendMessage(id, { text: u }, { contextInfo: { mentionedJid: [n], externalAdReply: { title: '', body: info.wm, thumbnailUrl: ppser, mediaType: 3, renderLargerThumbnail: false }}, mentions: [n] },{})
             }
             break;
            }
            
        }
        } catch (e) {
        console.log(e);
        }
    });
    
    
    shyzu.public = false
    
    shyzu.ev.on('creds.update', await saveCreds);
    
    shyzu.sendButton = async (jid, text, btn) => {
    let msg = generateWAMessageFromContent(jid, { viewOnceMessage: {
        message: { 
            "messageContextInfo": { 
            "deviceListMetadata": {}, 
            "deviceListMetadataVersion": 2
        }, 
        interactiveMessage: proto.Message.InteractiveMessage.create({
        contextInfo: { 
            mentionedJid: [jid] 
        },
        body: proto.Message.InteractiveMessage.Body.create({ 
            text: text
        }), 
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ 
        buttons: btn
        })
        })}
        }}, { userJid: jid, quoted: m })
        await shyzu.relayMessage(msg.key.remoteJid, msg.message, { 
        messageId: msg.key.id 
        })
    }
    
    return shyzu;
}

whatsappConnect();

process.on('uncaughtExceptopn', function (e) {
    console.log('Caught exception', e);
})
