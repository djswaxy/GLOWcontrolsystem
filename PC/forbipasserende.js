const isConnectedForbiPasserende = document.getElementById("isConnectedForbiPasserende");
const socket = new WebSocket('ws://localhost:6969');


socket.onopen = function(event) {
    // Handle connection open

    isConnectedForbiPasserende.style.backgroundImage = "url('Connected.png')";

};
const totalpassers = document.getElementById("totalPassers");
const totalpassersweek = document.getElementById("totalPassersWeek");
const mostactivehour = document.getElementById("mostActiveHourValue");
const total_all_time = document.getElementById("totalAllTime");

socket.onmessage = function(event) {
    try {
        const parsedMsg = JSON.parse(event.data);

        // Hvis vi mottar sensordata fra Node.js
        if (parsedMsg.kommando === "sensorData") {
            const data = parsedMsg.data;

            // Oppdater HTML med de ekte verdiene fra Arduino
            totalpassers.innerHTML = data.passerbyDay;
            totalpassersweek.innerHTML = data.passerbyWeek;

            // Formatér mest aktive time pent (f.eks "Kl. 14:00 (52 personer)")
            let klokkeSlett = data.passerbyMAH < 10 ? "0" + data.passerbyMAH : data.passerbyMAH;
            mostactivehour.innerHTML = `Kl. ${klokkeSlett}:00 (${data.passerbyMAHAmount} personer)`;

            total_all_time.innerHTML = data.passerbyAllTime;

            console.log("Statistikk oppdatert på skjermen!");
        }
    } catch (e) {
        // Ignorer vanlige tekstbeskjeder som {status: "Mottatt"}
    }
};

socket.onclose = function(event) {
    // Handle connection close
};



function sendMessage(message) {
    socket.send(message);
}


function get24HrStat() {sendMessage('24hr')}
