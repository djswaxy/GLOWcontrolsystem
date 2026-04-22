const WebSocket = require('ws');
const date = new Date();
const hour = date.getHours();
const minute = date.getMinutes();
const second = date.getSeconds();
const wss = new WebSocket.Server({ port: 6969 });

const data = {
    message: '0900-1000: 5 passed by'
};
const Last24HrStat = {
    message: "00: 52, 01:24 ,02: 51, 03: 54"
};
wss.on('connection', function connection(ws) {
    function Send24HrStat() {
        const data = `${hour}:${minute}.${second} || Sent 24hr stat`;
        ws.send(JSON.stringify(data));
        ws.send(JSON.stringify(Last24HrStat));
    }
    function changeSetting(setting, value) {

        ws.send(JSON.stringify( `${hour}:${minute}.${second} ||`));
        ws.send(JSON.stringify("Changed " + setting + " to " + value + ""));
    }


    ws.on('message', function incoming(message) {
        // Handle incoming message
        console.log('\n[\x1b[32m MESSAGE RECIEVED\x1b[0m ] : %s', message);
        if (message.toString() === '24hr') {
            console.log('\n[ SENDING 24HR STAT --> ]');
            Send24HrStat();

        } else if (message.includes(':')) {

            message = message.toString();
            const [setting, value] = message.split(':');
            console.log('\n[\x1b[33m--- DETECTED SETTING CHANGE ---\x1b[0m]\n' +
                'Setting: ' + setting + '\n' + 'Value: ' + value);


        }
    });

    ws.on('close', function() {
        // Handle connection close
    });
});