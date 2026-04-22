const yValues = [55, 49, 44, 24, 15];
const regValues = [124, 89, 92, 124, 100];
const xLabels = [1, 2, 3, 4, 5]; // Repræsentant for "Tid i timer"
Chart.defaults.color = 'white';
new Chart(myChart, {
    type: "line",
    data: {
        labels: xLabels, // VIGTIGT: Uden labels tegnes linjerne ikke
        datasets: [
            {
                label: "G.L.O.W",
                borderColor: "green",
                backgroundColor: "green", // God idé at tilføje for punkterne
                data: yValues
            }, {
                label: "Constant Light",
                borderColor: "red",
                backgroundColor: "red",
                data: regValues
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
                title: { display: true, text: "Tid i timer", color: 'white' }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)', // Hvit med 20% synlighet
                    borderColor: 'white',             // Selve akselinjen til venstre
                },
                ticks: { color: 'white' },
                title: { display: true, text: "Strømforbrug i Watt", color: 'white' }
            }
        },
        plugins: {
            legend: {
                labels: { color: 'white' }
            }
        }
    }
});