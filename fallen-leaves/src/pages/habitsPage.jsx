import React from 'react'
import styles from './css/habitsPage.module.css'

function HabitsPage() {
    return (
        <div className={styles.container}>
            <select id="habitDropdown" className='inter_font'>
                <option value="option1">Habit 1</option>
                <option value="option2">Habit 2</option>
                <option value="option3">Habit 3</option>
            </select>

            <table className={styles.table}>
                <thead className='lora_font'>
                    <tr>
                        <th>Entry Date/Time</th>
                        <th>Entry Data</th>
                    </tr>
                </thead>
                <tbody className='inter_font'>
                    <tr>
                        <td>2024-09-28 14:30</td>
                        <td>Sample entry data 1</td>
                    </tr>
                    <tr>
                        <td>2024-09-28 15:00</td>
                        <td>Sample entry data 2</td>
                    </tr>
                    <tr>
                        <td>2024-09-28 15:30</td>
                        <td>Sample entry data 3</td>
                    </tr>
                    <tr>
                        <td>2024-09-28 16:00</td>
                        <td>Sample entry data 4</td>
                    </tr>
                </tbody>
            </table>

            <div className={styles.buttons}>
                <button className='btnPrimaryDesktop'>Add Entry</button>
                <button className='btnSecondaryDesktop'>Add Habit</button>
            </div>
        </div>
    )
}

export default HabitsPage