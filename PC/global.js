const WebSocket = require('ws');
const { SerialPort } = require('serialport');

const port = new SerialPort({
    path: 'COM3', // Husk å sjekke at dette er riktig port
    baudRate: 9600
});

// 1. Listen med de 6 bytene du vil sende (bytt ut med dine egne hex-verdier)
const myBytes = new Uint8Array([0xAA, 0x01, 0x55, 0xFF, 0x0A, 0xBB]);
port.write(myBytes);
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
port.on('data', (data) => {
    // 'data' er et Buffer-objekt. Vi printer det direkte:
    console.log('[MOTTATT RÅDATA]:', data);

    // Hvis du vil ha det mer lesbart (for eksempel for å sjekke at det er riktig hex-verdi):
    // const hexString = data.toString('hex').toUpperCase();
    // console.log(`[HEX]: 0x${hexString}`);
});
// 4. Vent til porten er åpen, og start funksjonen
port.on('open', () => {
    console.log('Port opened successfully!');
    sendBytesEnAvGangen();
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