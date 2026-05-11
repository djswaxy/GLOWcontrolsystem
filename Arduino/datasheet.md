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

SUB TABELL FOR ADJUSTED SETTING RESPONSE [ARDUINO -> PC]
**BOLD** er i disse brugt til switch statements, det er veldig viktig at de bytes er korrekte
| Adjusted Settings!  | Bytes |
|----------|-------|
| Adjusted Mvmnt Sens + Light Duration by X and Y | 0xAA 0xAC **0x00** 0x(X) 0x(Y) 0xBB |
| Adjusted Mvmnt Trig Alone by X   | 0xAA 0xAC **0x01** 0x(X) 0x00 0xBB |
| Adjusted Light Duration Alone by X  | 0xAA 0xAC **0x02** 0x(X) 0x00 0xBB |

SUB TABELL FOR SENDING 24HR SETTING [ARDUINO -> PC]
**BOLD** er i disse brugt til switch statements, det er veldig viktig at de bytes er korrekte
| 24HR SENSOR DATA  | Bytes |
|----------|-------|
| Passerby's Today, amount(X) | 0xAA 0xAB **0x00** 0x(X) 0x00 0xBB |
| Passerby's Most Active Hour(X), amount(Y) | 0xAA 0xAB **0x01** 0x(X) 0x(Y) 0xBB |
| Passerby's Week, Amount(X)   | 0xAA 0xAC **0x02** 0x(X) 0x00 0xBB |
| Passerby's All Time, Amount(X)  | 0xAA 0xAC **0x03** 0x(X) 0x00 0xBB |


*commands from PC -> to Arduino*
| Command from PC  | Bytes |
|----------|-------|
| Send 24hr Sensor Data, please   | 0xAA 0xAD 0xAD 0xAD 0xAD 0xBB |
| Send Passerby Statistics, please   | 0xAA 0xAE 0xAE 0xAE 0xAE 0xBB |
| Adjust Setting X by Y, please    | 0xAA 0xAF *data data data* 0xBB |
| General Acknowledge  | 0xAA 0xEE 0xEE 0xEE 0xEE 0xBB  |
