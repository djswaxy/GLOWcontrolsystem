
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 6969 });
console.log("\x1b[93m[ SERVER START ]\033[0m\n\n\n")

wss.on('connection', function connection(ws) {
    console.log("\x1b[42m[CONNECTION OPENED]\033[0m")

    ws.on('message', function incoming(message) {
        console.log("\x1b[93m\n[-> RECIEVED MESSAGE]\n\033[0m")
        console.log('Received: %s', message);
        if (message.toString() === "24hr") {
            console.log("-- Detected 24HR Message --")
        }
        if ((message.toString()).includes(":::")) {
            console.log("\u001b[44m[-- Detected Setting Change --]\033[0m")
            const [setting, value] = message.toString().split(':::');
            console.log(`Setting: ${setting}, Value: ${value}`);
        }

        ws.send(`${message}`);
    });


    ws.on('close', function() {
        // Handle connection close
        console.log("\x1b[31m\n[CONNECTION CLOSED]\033[0m")
    });

});

/*

const SerialPortPath = 'COM5'
const { SerialPort } = require('serialport');
const comPort1 = new SerialPort({
    path: 'COM4',
    baudRate: 19200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
});

comPort1.on('open', () => {
    console.log('Serial port opened');
    isConnected.innerHTML = "Connected";
    comPort1.write('Hello, UART!', (err) => {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        console.log('Message written');
    });
});

comPort1.on('data', (data) => {
    console.log('Data received: ', data.toString());
});

comPort1.on('error', (err) => {
    console.log('Error: ', err.message);
});


// legg til data parsing her
*/