const isConnectedForbiPasserende = document.getElementById("isConnectedForbiPasserende");
const socket = new WebSocket('ws://localhost:6969');


socket.onopen = function(event) {
    // Handle connection open

    isConnectedForbiPasserende.style.color = 'green';
    isConnectedForbiPasserende.innerText = `Connected`;

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

const totalpassers = document.getElementById("totalPassers");
const totalpassersweek = document.getElementById("totalPassersWeek");
const mostactivehour = document.getElementById("mostActiveHourValue");
const total_all_time = document.getElementById("totalAllTime");

//EKSEMPLER!! ENDRE DETTE FØR PROSJEKT!!
totalpassers.innerHTML = Math.floor((Math.random() * 10));
totalpassersweek.innerHTML = Math.floor((Math.random() * 40));
mostactivehour.innerHTML = Math.floor((Math.random() * 24));
total_all_time.innerHTML = Math.floor((Math.random() * 1000));

function get24HrStat() {sendMessage('24hr')}
