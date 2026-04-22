const yValues = [5,3,6,12,6,3,24,25,27,12,34,22,12,35,44,22,31,30,45,20,19,15,12,1];
const regValues = [124, 89, 92, 124, 100];
const xLabels = [0,1,2,3,4,5,6,7,8,9,10,11,12, 13, 14, 15, 16,17,18,19,20,21,22,23]; // Repræsentant for "Tid i timer"
Chart.defaults.color = 'white';
new Chart(myChart, {
    type: "bar",
    data: {
        labels: xLabels, // VIGTIGT: Uden labels tegnes linjerne ikke
        datasets: [
            {
                label: "Forbipasserende",
                borderColor: "green",
                backgroundColor: "green", // God idé at tilføje for punkterne
                data: yValues
            }]
    },
    options: {
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Hvit med 20% synlighet (anbefales)
                    borderColor: 'white',             // Selve akselinjen nederst
                },
                ticks: { color: 'white' },
                title: { display: true, text: "Klokkeslett", color: 'white' }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Hvit med 20% synlighet
                    borderColor: 'white',             // Selve akselinjen til venstre
                },
                ticks: { color: 'white' },
                title: { display: true, text: "Antall Forbipasserende", color: 'white' }
            }
        },
        plugins: {
            legend: {
                labels: { color: 'white' }
            }
        }
    }
});
const totalpassers = document.getElementById("totalPassers");
const totalpassersweek = document.getElementById("totalPassersWeek");
const mostactivehour = document.getElementById("mostActiveHourValue");
const total_all_time = document.getElementById("totalAllTime");

totalpassers.innerHTML = Math.floor((Math.random() * 10));
totalpassersweek.innerHTML = Math.floor((Math.random() * 40));
mostactivehour.innerHTML = Math.floor((Math.random() * 24));
total_all_time.innerHTML = Math.floor((Math.random() * 1000));