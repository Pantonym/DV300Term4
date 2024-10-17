import React from 'react'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components from Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ chartData }) {
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
                text: 'Monthly Habit Completion',
            },
            tooltip: {
                titleColor: '#ffffff', // Tooltip title color
                bodyColor: '#ffffff', // Tooltip body color
                backgroundColor: '#333', // Tooltip background color
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#000000', // Change X-axis label color
                },
                grid: {
                    color: '#C5C5C5', // Change X-axis gridline color (optional)
                },
            },
            y: {
                ticks: {
                    color: '#000000', // Change Y-axis label color
                },
                grid: {
                    color: '#C5C5C5', // Change Y-axis gridline color (optional)
                },
            },
        },
    };

    return <Bar data={chartData} options={options} />;
}

export default BarChart