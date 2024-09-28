import React from 'react'
import styles from './css/homePage.module.css'
import BarChart from '../components/charts/BarChart'

function HomePage() {
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
            <BarChart />

        </div>
    )
}

export default HomePage