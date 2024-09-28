import React from 'react'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary components from Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart() {
    // Dummy data for the chart
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Habit 1',
                data: [12, 19, 10, 5, 12, 6],
                backgroundColor: 'rgba(209, 90, 78, 1)',
                borderColor: 'rgba(209, 90, 78, 1)',
                borderWidth: 1,
            },
            {
                label: 'Habit 2',
                data: [10, 11, 14, 2, 18, 7],
                backgroundColor: 'rgba(242, 160, 123, 1)',
                borderColor: 'rgba(242, 160, 123, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Habit Completion',
            },
        },
    };

    return <Bar data={data} options={options} />;
}

export default BarChart