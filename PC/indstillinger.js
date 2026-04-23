settingsIsConnected = document.getElementById("settingsIsConnected");
const socket = new WebSocket('ws://localhost:6969');
const movementTrigSensitivity = document.getElementById("movementTrigSensitivity");
const lightDuration = document.getElementById("lightDuration");
const changeSettingBtn = document.getElementById("changeSettingBtn");
let movementTrigSensitivityValue = movementTrigSensitivity.value;
let lightDurationValue = lightDuration.value;

changeSettingBtn.addEventListener('click', () => {
    let movementTrigSensitivityValue = movementTrigSensitivity.value;
    let lightDurationValue = lightDuration.value;
    if (movementTrigSensitivityValue !== '' && lightDurationValue !== '') {
        changeSetting('movementTrigSensitivity', movementTrigSensitivityValue);
        changeSetting('lightDuration', lightDurationValue);
    }
})

socket.onopen = function(event) {
    // Handle connection open

    settingsIsConnected.style.color = 'green';
    settingsIsConnected.innerText = `Connected`;

};
socket.onmessage = function(event) {
    // Handle received message
    const data = JSON.parse(event.data);
    console.log(data);

};

socket.onclose = function(event) {
    // Handle connection close
};
function sendMessage(message) {
    socket.send(message);
}
function changeSetting(setting, value) {sendMessage(setting + ':::' + value)}