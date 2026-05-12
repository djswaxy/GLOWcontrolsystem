const WebSocket = require('ws');
const { SerialPort } = require('serialport');


const ConnAcknowledge = new Uint8Array([0xAA, 0xEE, 0xEE, 0xEE, 0xEE, 0xBB]);
const AskForSensorData = new Uint8Array([0xAA, 0xAB, 0x00, 0x00, 0x00, 0xBB]);
const myBytes = new Uint8Array([0xAA, 0x01, 0x55, 0xFF, 0x0A, 0xBB]);

function sendPacket(packetArray) { // alternativ instant packet sender
    const buffer = Buffer.from(packetArray);
    port.write(buffer, (err) => {
        if (err) console.error('Feil ved sending:', err.message);
    });
    console.log(`Sendte pakke: 0x${buffer.toString('hex').toUpperCase()}`);
}
function changeSetting(setting, value) {
    let settingP = 0x00;
    if(setting === "movementTrigSensitivity") {
        settingP = 0x01
    }
    if(setting === "lightDuration") {
        settingP = 0x02;
    }
    if(setting === "maxLightStrength") {
        settingP = 0x03;
    }
    if(setting === "standbyLightStrength") {
        settingP = 0x04;
    }
    const settingChangePacket = new Uint8Array([0xAA, 0xAC, settingP, value, 0xFF, 0xBB]);
    sendPacket(settingChangePacket);
}


const port = new SerialPort({
    path: 'COM3', // Husk å sjekke at dette er riktig port
    baudRate: 9600
});
async function handleIncomingPacket(packet) {
    const hexString = Buffer.from(packet).toString('hex').toUpperCase();
    const formattedHex = hexString.match(/.{1,2}/g).join(' ');
    // blir på formen AA -- -- -- -- BB ingen 0x foran i formattedHex
    console.log(`\x1b[95m[-> MOTATT KOMPLETT PAKKE]: 0x${formattedHex}\x1b[0m`);
    const messageType = packet[1]; // byte nummer 2 etter 0xAA

    /*const hexLog = Buffer.from(packet).toString('hex').toUpperCase(); //log
    console.log(`[MOTTATT]: ${hexLog}`);*/

    switch(messageType) {
        case 0xAC: // arduino svar på endre setting kommando
            await handleSettingChangeResponse(packet);
            break;

        case 0xAB: //
            await handle24HrSensorData(packet);
            break;
        case 0xCC: //koble til Arduino
            await handleConnection();
            break;
        case 0xEE: //
            console.log("General Acknowledgement from Arduino");
            break;

    }
}
function handleSettingChangeResponse(packet) {
    if(packet[2] === 0x00) {
        /*
        console.log("Movement Trig Sensitivity: ", packet[3])
        console.log("Light Duration: ", packet[4]);*/
        console.log(`${Colors.lightBlue} PLEASE IMPLEMENT ALL SETTING CHANGE, nothing has been recieved${Colors.reset}`)

    }
    if(packet[2] === 0x01) {
        console.log("Confirmed Change Movement Trig Sensitivity to: ", packet[3]);
    }
    if(packet[2] === 0x02) {
        console.log("Confirmed Change Light Duration to: ", packet[3]);
    }
    if(packet[2] === 0x03) {
        console.log("Confirmed Change Max Light Strength to: ", packet[3]);
    }
    if(packet[2] === 0x03) {
        console.log("Confirmed Change Standby Light Strength to: ", packet[3]);
    }

}
function handle24HrSensorData(packet) {
    if(packet[2] === 0x00) { //passerby today
        // websocket send to Energibesparelse
        console.log("24t Sensor : Passerby's today: ", packet[3]);
    }
    if(packet[2] === 0x01) { //passerby most active hour
        // websocket send to Energibesparelse
        console.log("24t Sensor : Most Active Hour | HOUR: ", packet[3], " | PASSERBY's: ", packet[4]);
    }
    if(packet[2] === 0x02) { //passerbys week
        // websocket send to Energibesparelse
        console.log("24t Sensor : Passerby's Week ", packet[3]);
    }
    if(packet[2] === 0x03) { //passerbys all time
        // websocket send to Energibesparelse
        // packet 3 = high byte, packet 4 = low byte
        const highByte = packet[3];
        const lowByte = packet[4];
        const totalValue = (highByte << 8) | lowByte;
        console.log("24t Sensor : Passerby's All Time ", totalValue);

    }
}
function handleConnection() {
        // send tilbake connection til Arduino
        console.log("CONNECTION Request from ARDUINO");
        sendBytesEnAvGangen(ConnAcknowledge);
       // sendBytesEnAvGangen(Acknowledge);
       // console.log("-ACKNOWLEDGEMENT SENT-");
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


// 4. Vent til porten er åpen, og start funksjonen
port.on('open', () => {
    console.log('Port opened successfully!');
    delay(1000);
    changeSetting("movementTrigSensitivity", 10);
    delay(1000);
    changeSetting("lightDuration", 24);

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
const Colors = {
    // Text Colors
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",

    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m", // This is your Pink
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    // High Intensity (Brighter)
    pink: "\x1b[95m",
    orange: "\x1b[38;5;208m", // Using 256-color palette for Orange
    lightBlue: "\x1b[94m",
    lightGreen: "\x1b[92m",

    // Backgrounds (Good for Headers)
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m"
};