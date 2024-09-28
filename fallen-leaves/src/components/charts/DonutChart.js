import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Register the necessary components for the Donut chart (Doughnut in Chart.js)
ChartJS.register(ArcElement, Tooltip, Legend, Title);

function DonutChart({ chartData }) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
            title: {
                display: false,
            },
        },

        // This creates the donut effect by cutting out the center
        cutout: '60%',
    };

    return <Doughnut data={chartData} options={options} />;
}

export default DonutChart