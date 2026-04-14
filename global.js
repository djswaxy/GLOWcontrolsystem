// eksempelkode for å sette opp UART, vi inkluderer denne script filen
// i alle .html filer
const SerialPort = require('serialport');
const port = new SerialPort('/dev/tty-usbserial', {
    baudRate: 9600
});

port.on('open', () => {
    console.log('Serial port opened');
});

port.on('data', (data) => {
    console.log('Data received: ', data.toString());
});


// error handling her, måske bruke alert?
port.on('error', (err) => {
    console.log('Error: ', err.message);
});

// legg til data parsing her