import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

// Register the necessary components for Pie chart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

function PieChart({ chartData }) {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#000000', // Change legend text color (to white in this case)
                    font: {
                        size: 14, // Adjust the font size if needed
                    },
                },
            },
            title: {
                display: false,
                text: 'Habit Completion Distribution',
            },
        },
    };

    return <Pie data={chartData} options={options} />;
}

export default PieChart