const WebSocket = require('ws');
const { SerialPort } = require('serialport');

const port = new SerialPort({
    path: 'COM8', // Husk å sjekke at dette er riktig port
    baudRate: 9600
});

// 1. Listen med de 6 bytene du vil sende (bytt ut med dine egne hex-verdier)
const myBytes = new Uint8Array([0xAA, 0x01, 0x55, 0xFF, 0x0A, 0xBB]);

// 2. En hjelpefunksjon som skaper en pause (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 3. Funksjonen som sender én og én byte
async function sendBytesEnAvGangen() {
    console.log('Starter overføring av liste...');

    for (let i = 0; i < myBytes.length; i++) {
        // Hent ut én byte fra listen og gjør den om til en Buffer
        const singleByte = Buffer.from([myBytes[i]]);

        // Skriv den til porten
        port.write(singleByte, (err) => {
            if (err) console.error('Feil ved sending:', err.message);
        });

        // Skriv ut til terminalen hva vi nettopp sendte (konvertert til hex for lesbarhet)
        console.log(`Sendte byte ${i + 1}: 0x${myBytes[i].toString(16).toUpperCase()}`);

        // Vent 100 millisekunder før løkken fortsetter til neste byte
        await delay(1000);
    }

    console.log('Alle 6 bytes er sendt!');
}
// En global liste (samleboks) for å holde på innkommende data
let rxBuffer = [];

port.on('data', (data) => {
    // 1. Legg alle de nye bytene fra Arduinoen i samleboksen vår
    for (let i = 0; i < data.length; i++) {
        rxBuffer.push(data[i]);
    }

    // 2. Fortsett å sjekke så lenge vi har minst 6 bytes i boksen
    while (rxBuffer.length >= 6) {

        // 3. Hvis den første byten i boksen ikke er 0xAA, kast den (det er støy)
        if (rxBuffer[0] !== 0xAA) {
            rxBuffer.shift(); // Fjerner det første elementet
            continue;         // Gå til starten av while-løkken
        }

        // 4. Vi har funnet 0xAA! La oss hente ut en pakke på 6 bytes
        const packet = rxBuffer.splice(0, 6);

        // 5. Sjekk at den siste byten faktisk er 0xBB
        if (packet[5] === 0xBB) {
            // Suksess! Gjør det om til en fin hex-streng
            const hexString = Buffer.from(packet).toString('hex').toUpperCase();
            const formattedHex = hexString.match(/.{1,2}/g).join(' ');

            console.log(`[KOMPLETT PAKKE]: 0x${formattedHex}`);
            console.log('-----------------------------------');
        } else {
            console.log('[FEIL]: Fikk 6 bytes, men sluttet ikke på 0xBB. Kaster pakken.');
        }
    }
});
// 4. Vent til porten er åpen, og start funksjonen
port.on('open', () => {
    console.log('Port opened successfully!');
    setTimeout(() => {
        sendBytesEnAvGangen();
    }, 2500); //vent til fikset mottak av data

});

port.on('error', (err) => {
    console.error('Serial Port Error: ', err.message);
});


// --- WEBSOCKET SERVER ---
// It is standard practice to name the server 'wss' (WebSocket Server) to avoid confusing it with a client
const wss = new WebSocket.Server({ port: 6969 });
console.log("\x1b[93m[ SERVER START ]\033[0m\n\n\n");

// 'ws' represents the specific client that just connected
wss.on('connection', function connection(ws) {
    console.log("\x1b[42m[CONNECTION OPENED]\033[0m");

    // FIX: Listen to 'ws' (the client), NOT the server
    ws.on('message', function incoming(message) {
        console.log("\x1b[93m\n[-> RECIEVED MESSAGE]\n\033[0m");
        console.log('Received: %s', message);

        if (message.toString() === "24hr") {
            console.log("-- Detected 24HR Message --");
        }
        if ((message.toString()).includes(":::")) {
            console.log("\u001b[44m[-- Detected Setting Change --]\033[0m");
            const [setting, value] = message.toString().split(':::');
            console.log(`Setting: ${setting}, Value: ${value}`);
        }

        // FIX: Send data back to the specific client using 'ws.send'
        ws.send(`${message}`);
    });

    // FIX: Listen for the 'close' event on the specific client, not the server
    ws.on('close', function() {
        console.log("\x1b[31m\n[CONNECTION CLOSED]\033[0m");
    });
});