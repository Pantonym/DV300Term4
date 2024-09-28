import React, { useEffect, useState } from 'react'
import styles from './css/HomePage.module.css'
import BarChart from '../components/charts/BarChart'

function HomePage() {
    const [barData1, setBarData1] = useState(null);

    useEffect(() => {
        // Simulate an API call to fetch data
        const fetchData1 = async () => {
            const dataFromAPI = {
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
            setBarData1(dataFromAPI);
        };

        fetchData1();
    }, []);

    return (
        <div>
            {/* TODO: Get username from db */}
            <h1 className='inter_font'>Welcome, USERNAME</h1>

            <div className={styles.cardHolder}>
                <div className={styles.card}>
                    <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                    <h2>Add Habit</h2>
                </div>

                <div className={styles.card}>
                    <ion-icon name="add-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                    <h2>Add Entry</h2>
                </div>

                <div className={styles.card}>
                    <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                    <h2>View Insights</h2>
                </div>
            </div>

            <h1 className='inter_font'>Here are some insights on your habits:</h1>
            {barData1 ? <BarChart chartData={barData1} /> : <p>Loading chart data...</p>}

        </div>
    )
}

export default HomePage