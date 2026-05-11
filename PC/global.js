const WebSocket = require('ws');
const { SerialPort } = require('serialport');

const Acknowledge = new Uint8Array([0xAA, 0xEE, 0xEE, 0xEE, 0xEE, 0xBB]);
const myBytes = new Uint8Array([0xAA, 0x01, 0x55, 0xFF, 0x0A, 0xBB]);

const port = new SerialPort({
    path: 'COM8', // Husk å sjekke at dette er riktig port
    baudRate: 9600
});
async function HandleIncomingPacket(packet) {
    const hexString = Buffer.from(packet).toString('hex').toUpperCase();
    const formattedHex = hexString.match(/.{1,2}/g).join(' ');
    // blir på formen AA -- -- -- -- BB ingen 0x foran i formattedHex
    console.log(`[KOMPLETT PAKKE]: 0x${formattedHex}`);
    const messageType = packet[1]; // byte nummer 2 etter 0xAA

    const hexLog = Buffer.from(packet).toString('hex').toUpperCase(); //log
    console.log(`[MOTTATT]: ${hexLog}`);

    switch(messageType) {
        case 0xAC: // arduino svar på endre setting kommando
            if(packet[2] === 0x00) {
                console.log("Endring av setting er vellykket!");
                if(packet[3] === 0x00) {
                    console.log("Movement Trig Sensitivity: " + packet[4]);
                    console.log("Light Duration: " + packet[5]);
                } else if(packet[3] === 0x01) {
                    console.log("Movement Trig Sensitivity: " + packet[4]);
                } else if(packet[3] === 0x02) {
                    console.log("Light Duration: " + packet[4]);
                } else console.log("Ukjent setting endring")
            } else {
                console.log("Endring av setting feilet!");
            }
            break;

        case 0xAB: // 24t sensor data
            await handle24HrSensorData(packet);
            break;
        case 0xCC: //koble til Arduino
            await handleConnection();
            break;
        case 0xEE: //koble til Arduino
            console.log("General Acknowledgement from Arduino");
            break;

    }
}
function handle24HrSensorData(packet) {
    if(packet[2] === 0x00) { //passerby today
        // websocket send to Energibesparelse
    }
    if(packet[2] === 0x01) { //passerby most active hour
        // websocket send to Energibesparelse
    }
    if(packet[2] === 0x02) { //passerbys week
        // websocket send to Energibesparelse
    }
    if(packet[2] === 0x03) { //passerbys all time
        // websocket send to Energibesparelse
    }
}
function handleConnection() {

}

// 1. Listen med de 6 bytene du vil sende (bytt ut med dine egne hex-verdier)


// 2. En hjelpefunksjon som skaper en pause (delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 3. Funksjonen som sender én og én byte
async function sendBytesEnAvGangen(SendArray) {
    console.log('Starter overføring av liste...');

    for (let i = 0; i < SendArray.length; i++) {
        if (!(SendArray instanceof Uint8Array)) {
            console.error('Feil: Argumentet må være en Uint8Array');
            return;
        }
        // Hent ut én byte fra listen og gjør den om til en Buffer
        const singleByte = Buffer.from([SendArray[i]]);

        // Skriv den til porten
        port.write(singleByte, (err) => {
            if (err) console.error('Feil ved sending:', err.message);
        });

        // Skriv ut til terminalen hva vi nettopp sendte (konvertert til hex for lesbarhet)
        console.log(`Sendte byte ${i + 1}: 0x${SendArray[i].toString(16).toUpperCase()}`);

        // Vent 100 millisekunder før løkken fortsetter til neste byte
        await delay(1000);
    }

    console.log('Alle 6 bytes er sendt!');
}
// En global liste (samleboks) for å holde på innkommende data
let rxBuffer = [];
let isSending = false;
port.on('data', (data) => {
    // 1. Samle data i buffer (som før)
    for (let i = 0; i < data.length; i++) rxBuffer.push(data[i]);

    while (rxBuffer.length >= 6) {
        if (rxBuffer[0] !== 0xAA) {
            rxBuffer.shift();
            continue;
        }

        if (rxBuffer[5] === 0xBB) {
            const packet = rxBuffer.splice(0, 6); //putter inkommende 6 bytes i en array
            // SEND PAKKEN TIL EN EGEN FUNKSJON
            handleIncomingPacket(packet);
        } else {
            rxBuffer.shift();
        }
    }
});

port.on('data', (data) => {


    // 2. Fortsett å sjekke så lenge vi har minst 6 bytes i boksen
    while (rxBuffer.length >= 6) {



        // 4. Vi har funnet 0xAA! La oss hente ut en pakke på 6 bytes
        const packet = rxBuffer.splice(0, 6);

        // 5. Sjekk at den siste byten faktisk er 0xBB
        if (packet[5] === 0xBB) {
            // Suksess! Gjør det om til en fin hex-streng

            if (formattedHex === 'AA CC CC CC CC BB') {
                // --- HER SETTER VI INN LOGIKKEN ---
                if (isSending) {
                    console.log("Opptatt: Allerede i ferd med å sende data. Ignorerer forespørsel.");
                } else {
                    console.log("Mottatt Connection Request fra Arduino, venter 1s...");

                    // Vi bruker en async-funksjon inne i setTimeout for å håndtere await
                    setTimeout(async () => {
                        isSending = true; // Lås for andre forespørsler
                        console.log("Sending Acknowledgement...");

                        await sendBytesEnAvGangen(Acknowledge);

                        isSending = false; // Lås opp igjen når funksjonen er helt ferdig
                        console.log("Klar for nye oppdrag.");
                    }, 1000);
                }
                // ----------------------------------
            }
            console.log('-----------------------------------');
        } else {
            console.log('[FEIL]: Fikk 6 bytes, men sluttet ikke på 0xBB. Kaster pakken.');
        }
    }
});
// 4. Vent til porten er åpen, og start funksjonen
port.on('open', () => {
    console.log('Port opened successfully!');
    setTimeout(async () => {
        if (!isSending) {
            isSending = true;
            await sendBytesEnAvGangen(Acknowledge);
            isSending = false;
        }
    }, 2500);
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