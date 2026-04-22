// eksempelkode for å sette opp UART, vi inkluderer denne script filen
// i alle .html filer
let WebSocketServer = require('ws').Server;
const SERVER_PORT = 8081;               // port number for the webSocket server
let wss = new WebSocketServer({port: SERVER_PORT}); // the webSocket server
let connections = new Array;          // list of connections to the server
wss.on('connection', handleConnection);

function handleConnection(client) {
    console.log("New Connection"); // you have a new client
    connections.push(client); // add this client to the connections array

    client.on('message', sendToSerial); // when a client sends a message,

    client.on('close', function() { // when a client closes its connection
        console.log("connection closed"); // print it out
        let position = connections.indexOf(client); // get the client's position in the array
        connections.splice(position, 1); // and delete it from the array
    });
}

const isConnected = document.getElementById("isConnected");
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
