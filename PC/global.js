
let currentSettings = {
    movementTrigSensitivity: 10,
    lightDuration: 5,
    maxLightStrength: 255,
    standbyLightStrength: 50
};
const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const port = new SerialPort({
    path: 'COM7', // Husk å sjekke at dette er riktig port
    baudRate: 9600
});

const ConnAcknowledge = new Uint8Array([0xAA, 0xEE, 0xEE, 0xEE, 0xEE, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBB]);
const AskForSensorData = new Uint8Array([0xAA, 0xAB, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBB]);
const AskForCurrentSettings = new Uint8Array([0xAA, 0xAD, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xBB]);

function sendPacket(packetArray) {
    // 1. Lag en rå buffer (ekte bytes)
    const bufferToSend = Buffer.from(packetArray);

    // 2. Send DE RÅ BYTENE over porten, ikke teksten!
    port.write(bufferToSend, (err) => {
        if (err) console.error('Feil ved sending:', err.message);
    });

    // 3. Gjør det om til en pen tekststreng BARE for å printe i terminalen
    const hexString = bufferToSend.toString('hex').toUpperCase();
    const formattedHex = hexString.match(/.{1,2}/g).join(' ');
    console.log(`${Colors.dim}[SENDTE PAKKE ->]: 0x${formattedHex}${Colors.reset}`);
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
            await handleBulkSettingResponse(packet);
            break;

        case 0xAB: //
            await handleSensorData(packet);
            break;
        case 0xCC: //koble til Arduino
            await handleConnection();
            break;
        case 0xEE: //
            console.log("General Acknowledgement from Arduino");
            break;

    }
}
function handleSensorData(packet) {
    console.log(`${Colors.bgRed}${Colors.black} [-- Bulk Sensor Data Hentet fra Arduino --] ${Colors.reset}`);

    const passerbyDay    = (packet[2] << 8) | packet[3];
    const passerbyMAH     = (packet[4] << 8) | packet[5];
    const passerbyWeek    = (packet[6] << 8) | packet[7];
    const passerbyAllTime = (packet[8] << 8) | packet[9];

}
function handleBulkSettingResponse(packet) {
    console.log(`${Colors.bgGreen}${Colors.black} [-- Bulk Settings Bekreftet/Hentet fra Arduino --] ${Colors.reset}`);
    const sens    = (packet[2] << 8) | packet[3];
    const dur     = (packet[4] << 8) | packet[5];
    const maxL    = (packet[6] << 8) | packet[7];
    const standby = (packet[8] << 8) | packet[9];

    // 1. Oppdater PC-ens minne
    currentSettings.movementTrigSensitivity = sens;
    currentSettings.lightDuration = dur;
    currentSettings.maxLightStrength = maxL;
    currentSettings.standbyLightStrength = standby;

    console.log(`${Colors.cyan}1. Følsomhet (Sens)  : ${Colors.bright}${sens}${Colors.reset}`);
    console.log(`${Colors.cyan}2. Lys Varighet   : ${Colors.bright}${dur}${Colors.reset}`);
    console.log(`${Colors.cyan}1. Max Lys   : ${Colors.bright}${maxL}${Colors.reset}`);
    console.log(`${Colors.cyan}2. Standby Lys   : ${Colors.bright}${standby}${Colors.reset}`);


    // 2. Send de nye innstillingene til ALLE tilkoblede nettsider (WebSockets)
    const payload = JSON.stringify({
        kommando: "currentSettings",
        data: currentSettings
    });

    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

function changeAllSettings(sens, dur, maxL, standby) {
    const getHigh = (val) => (val >> 8) & 0xFF;
    const getLow = (val) => val & 0xFF;

    // Pakker alt inn i den nye 11-byte strukturen
    const bulkPacket = new Uint8Array([
        0xAA,
        0xAC,
        getHigh(sens), getLow(sens),       // Bytes 2 og 3
        getHigh(dur), getLow(dur),         // Bytes 4 og 5
        getHigh(maxL), getLow(maxL),       // Bytes 6 og 7
        getHigh(standby), getLow(standby), // Bytes 8 og 9
        0xBB
    ]);

    console.log(`Sender alle innstillinger. Pakkestørrelse: ${bulkPacket.length} bytes`);
    sendPacket(bulkPacket); //
}
/*
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
}*/
function handleConnection() {
        // send tilbake connection til Arduino

        sendPacket(ConnAcknowledge);


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

    while (rxBuffer.length >= 11) {
        if (rxBuffer[0] !== 0xAA) {
            rxBuffer.shift();
            continue;
        }

        if (rxBuffer[10] === 0xBB) {
            const packet = rxBuffer.splice(0, 11); //putter inkommende 6 bytes i en array
            // SEND PAKKEN TIL EN EGEN FUNKSJON
            handleIncomingPacket(packet);
        } else {
            rxBuffer.shift();
        }
    }
});


// 4. Vent til porten er åpen, og start funksjonen
port.on('open', async () => {
    console.log('Port opened successfully!');


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

    ws.on('message', function incoming(message) {
        console.log("\x1b[93m\n[-> RECIEVED MESSAGE FRA WEBSOCKET]\n\x1b[0m");
        const msgStr = message.toString();

        try {
            // Prøv å tolke meldingen som JSON
            const parsedMsg = JSON.parse(msgStr);

            // Sjekk om det er bulk-oppdateringen vår
            if (parsedMsg.kommando === "oppdaterAlleInnstillinger") {
                console.log("\u001b[44m[-- Detected Bulk Setting Change --]\x1b[0m");

                // 1. Oppdater PC-ens hukommelse med de nye verdiene
                currentSettings.movementTrigSensitivity = parsedMsg.data.movementTrigSensitivity;
                currentSettings.lightDuration           = parsedMsg.data.lightDuration;
                currentSettings.maxLightStrength        = parsedMsg.data.maxLightStrength;
                currentSettings.standbyLightStrength    = parsedMsg.data.standbyLightStrength;

                // 2. Send alt ned til Arduinoen i ÉN operasjon
                changeAllSettings(
                    currentSettings.movementTrigSensitivity,
                    currentSettings.lightDuration,
                    currentSettings.maxLightStrength,
                    currentSettings.standbyLightStrength
                );
            }
        } catch (e) {
            if (msgStr === "fetchCurrentSettings") {
                console.log("-- Forespørsel fra nettside: Henter innstillinger fra Arduino --");
                sendPacket(AskForCurrentSettings); // Sender 0xAD-pakken din over Serial
            }
            if (msgStr === "updateSensor") {
                console.log("-- Detected Update Sensor Message --");
                // implementer sensor data logikk her
            } else {
                console.log('Mottok ukjent beskjed: %s', msgStr);
            }
        }

        // Send bekreftelse tilbake til nettsiden
        ws.send(JSON.stringify({ status: "Mottatt" }));
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