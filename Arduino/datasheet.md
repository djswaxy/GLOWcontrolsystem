      /$$$$$$  /$$        /$$$$$$  /$$      /$$
      /$$__  $$| $$       /$$__  $$| $$  /$ | $$
    | $$  \__/| $$      | $$  \ $$| $$ /$$$| $$
    | $$ /$$$$| $$      | $$  | $$| $$/$$ $$ $$
    | $$|_  $$| $$      | $$  | $$| $$$$_  $$$$
    | $$  \ $$| $$      | $$  | $$| $$$/ \  $$$
    |  $$$$$$/| $$$$$$$$|  $$$$$$/| $$/   \  $$
     \______/ |________/ \______/ |__/     \__/ Datasheet v.1
                                           
                                           
                                           
# Communication Datasheet for Glow PC <-> Arduino
**All commands will start with 0xAA and end with 0xBB and is 6 bytes long**
<br>
*on startup, Arduino will connect to the PC, PC will general acknowledge, then UART is ready, commands can be executed.*
data data data indicates bytes reserved for sending actual data, a setting, a value etc. Maybe multiple packets are needed for many statistics?
<br>
*commands from Arduino -> to PC*
| Command from Arduino  | Bytes |
|----------|-------|
| Try Connect to PC | 0xAA 0xCC 0xCC 0xCC 0xCC 0xBB |
| Sending 24hr sensor data   | 0xAA 0xAB *data data data* 0xBB |
| Adjusted Settings  | 0xAA 0xAC *data data data* 0xBB |
| General Acknowledge  | 0xAA 0xEE 0xEE 0xEE 0xEE 0xBB  |

*commands from PC -> to Arduino*
| Command from PC  | Bytes |
|----------|-------|
| Send 24hr Sensor Data, please   | 0xAA 0xAD 0xAD 0xAD 0xAD 0xBB |
| Send Passerby Statistics, please   | 0xAA 0xAE 0xAE 0xAE 0xAE 0xBB |
| Adjust Setting X by Y, please    | 0xAA 0xAF *data data data* 0xBB |
| General Acknowledge  | 0xAA 0xEE 0xEE 0xEE 0xEE 0xBB  |
