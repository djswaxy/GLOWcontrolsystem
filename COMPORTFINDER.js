// Source - https://stackoverflow.com/a/75828011
// Posted by Lothre1, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-14, License - CC BY-SA 4.0

var sp = require('serialport')

sp.SerialPort.list()
    .then((data) => console.log(data))
    .catch(err => console.log(err));
