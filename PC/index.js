const isConnected = document.getElementById("isConnected");
const socket = new WebSocket('ws://localhost:6969');


socket.onopen = function(event) {
    // Handle connection open

    isConnected.style.backgroundImage = "url('Connected.png')";


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
