
let currentSettings = {
    movementTrigSensitivity: 10,
    distance: 5,
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

    const passerbyDay       = packet[2];
    const passerbyMAH       = packet[3];
    const passerbyMAHAmount = packet[4];
    const passerbyWeek      = (packet[5] << 8) | packet[6];
    const passerbyAllTime   = (packet[7] << 8) | packet[8];

    console.log(`${Colors.yellow}1. Forbipasserende i dag: ${Colors.bright}${passerbyDay}${Colors.reset}`);
    console.log(`${Colors.yellow}2. Mest aktive time     : ${Colors.bright}Kl. ${passerbyMAH} (${passerbyMAHAmount} personer)${Colors.reset}`);
    console.log(`${Colors.yellow}3. Forbipasserende uke  : ${Colors.bright}${passerbyWeek}${Colors.reset}`);
    console.log(`${Colors.yellow}4. Forbipasserende total: ${Colors.bright}${passerbyAllTime}${Colors.reset}\n`);

    // 1. Pakk dataene inn i JSON
    const payload = JSON.stringify({
        kommando: "sensorData",
        data: {
            passerbyDay: passerbyDay,
            passerbyMAH: passerbyMAH,
            passerbyMAHAmount: passerbyMAHAmount,
            passerbyWeek: passerbyWeek,
            passerbyAllTime: passerbyAllTime
        }
    });

    // 2. Send til alle tilkoblede nettsider
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}
function handleBulkSettingResponse(packet) {
    console.log(`${Colors.bgGreen}${Colors.black} [-- Bulk Settings Bekreftet/Hentet fra Arduino --] ${Colors.reset}`);
    const sens    = (packet[2] << 8) | packet[3];
    const dist     = (packet[4] << 8) | packet[5];
    const maxL    = (packet[6] << 8) | packet[7];
    const standby = (packet[8] << 8) | packet[9];

    // 1. Oppdater PC-ens minne
    currentSettings.movementTrigSensitivity = sens;
    currentSettings.distance = dist;
    currentSettings.maxLightStrength = maxL;
    currentSettings.standbyLightStrength = standby;

    console.log(`${Colors.cyan}1. Følsomhet (Sens)  : ${Colors.bright}${sens}${Colors.reset}`);
    console.log(`${Colors.cyan}2. Bevegelse Distance  : ${Colors.bright}${dist}${Colors.reset}`);
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

function changeAllSettings(sens, dist, maxL, standby) {
    const getHigh = (val) => (val >> 8) & 0xFF;
    const getLow = (val) => val & 0xFF;

    // Pakker alt inn i den nye 11-byte strukturen
    const bulkPacket = new Uint8Array([
        0xAA,
        0xAC,
        getHigh(sens), getLow(sens),       // Bytes 2 og 3
        getHigh(dist), getLow(dist),         // Bytes 4 og 5
        getHigh(maxL), getLow(maxL),       // Bytes 6 og 7
        getHigh(standby), getLow(standby), // Bytes 8 og 9
        0xBB
    ]);

    console.log(`Sender alle innstillinger. Pakkestørrelse: ${bulkPacket.length} bytes`);
    sendPacket(bulkPacket); //
}

function handleConnection() {
        // send tilbake connection til Arduino

        sendPacket(ConnAcknowledge);


}

// delay funksjon
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
// wss is websocket server, ws is client
const wss = new WebSocket.Server({ port: 6969 });
console.log("\x1b[93m[ SERVER START ]\033[0m\n\n\n");

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
                currentSettings.distance           = parsedMsg.data.distance;
                currentSettings.maxLightStrength        = parsedMsg.data.maxLightStrength;
                currentSettings.standbyLightStrength    = parsedMsg.data.standbyLightStrength;

                // 2. Send alt ned til Arduinoen i ÉN operasjon
                changeAllSettings(
                    currentSettings.movementTrigSensitivity,
                    currentSettings.distance,
                    currentSettings.maxLightStrength,
                    currentSettings.standbyLightStrength
                );
            }
        } catch (e) {
            if (msgStr === "fetchCurrentSettings") {
                console.log("-- Forespørsel fra nettside: Henter innstillinger fra Arduino --");
                sendPacket(AskForCurrentSettings);
            }
            // Endret fra "updateSensor" til "24hr" slik at den matcher frontend-knappen!
            else if (msgStr === "24hr") {
                console.log("-- Forespørsel fra nettside: Henter sensordata fra Arduino --");
                sendPacket(AskForSensorData); // Sender 0xAB pakken over Serial
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

    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m"
};