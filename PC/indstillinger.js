settingsIsConnected = document.getElementById("settingsIsConnected");
const socket = new WebSocket('ws://localhost:6969');

const movementTrigSensitivity = document.getElementById("movementTrigSensitivity");
const distance = document.getElementById("distance");
const maxLightStrength = document.getElementById("maxLightStrength");
const standbyLightStrength = document.getElementById("standbyLightStrength");
const changeSettingBtn = document.getElementById("changeSettingBtn");
const fetchCurrentSettingsBtn = document.getElementById("fetchCurrentSettingsBtn");
changeSettingBtn.addEventListener('click', () => {
    // 1. Samle alle verdier og gjør dem om til tall (parseInt)
    const nyeInnstillinger = {
        movementTrigSensitivity: parseInt(movementTrigSensitivity.value, 10),
        distance: parseInt(distance.value, 10),
        maxLightStrength: parseInt(maxLightStrength.value, 10),
        standbyLightStrength: parseInt(standbyLightStrength.value, 10)
    };
    const payload = {
        kommando: "oppdaterAlleInnstillinger",
        data: nyeInnstillinger
    };

    sendMessage(JSON.stringify(payload));

    console.log("Sendte alle innstillinger:", payload);
});
fetchCurrentSettingsBtn.addEventListener('click', () => {
    sendMessage("fetchCurrentSettings");
})

socket.onopen = function(event) {
    // Handle connection open

    settingsIsConnected.style.backgroundImage = "url('Connected.png')";


};
socket.onmessage = function(event) {
    // Prøv å lese data. Hvis Node.js bare sender en tekststreng, unngår vi at koden krasjer.
    try {
        const data = JSON.parse(event.data);
        console.log("Mottatt JSON:", data);
    } catch (e) {
        console.log("Mottatt Tekst:", event.data);
    }
};

socket.onclose = function(event) {
    // Handle connection close
};
function sendMessage(message) {
    socket.send(message);
}
function changeSetting(settingName, value) {
    const formattedMessage = `${settingName}:::${value}`;
    sendMessage(formattedMessage);
}

socket.onmessage = function(event) {
    try {
        const parsedMsg = JSON.parse(event.data);

        // Hvis vi får innstillinger fra Node.js
        if (parsedMsg.kommando === "currentSettings") {
            const data = parsedMsg.data;

            // Oppdater verdiene på selve slideren
            movementTrigSensitivity.value = data.movementTrigSensitivity;
            distance.value = data.distance;
            maxLightStrength.value = data.maxLightStrength;
            standbyLightStrength.value = data.standbyLightStrength;

            // Oppdater teksten (<output>) ved siden av slideren
            movementTrigSensitivity.nextElementSibling.value = data.movementTrigSensitivity;
            distance.nextElementSibling.value = data.distance;
            maxLightStrength.nextElementSibling.value = data.maxLightStrength;
            standbyLightStrength.nextElementSibling.value = data.standbyLightStrength;

            console.log("Sliderne er oppdatert med verdier fra Arduino!");
        }
    } catch (e) {
        // Hvis meldingen ikke er JSON (f.eks "Mottatt")
        console.log("Server melding:", event.data);
    }
};