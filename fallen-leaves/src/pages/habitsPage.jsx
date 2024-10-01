import React, { useEffect, useState } from 'react'
import styles from './css/HabitsPage.module.css'
import { Oval } from 'react-loader-spinner';

function HabitsPage() {
    // Form Control
    const [entryFormShow, setEntryFormShow] = useState(false);
    const [habitFormShow, setHabitFormShow] = useState(false);
    // Loading Controller
    const [loading, setLoading] = useState(true);

    // ENTRY FORM
    const handleAddEntryClick = () => {
        setEntryFormShow(true);
    };

    const handleEntryCancelClick = () => {
        setEntryFormShow(false);
    };

    // HABIT FORM
    const handleAddHabitClick = () => {
        setHabitFormShow(true);
    };

    const handleHabitCancelClick = () => {
        setHabitFormShow(false);
    };

    useEffect(() => {
        // Data will be gathered here
        setLoading(false);
    }, []);

    // Loader
    if (loading) {
        return (
            <div className="loadingContainer">
                <Oval color="#D75B30" height={80} width={80} />
            </div>
        );
    }

    return (
        <div>
            {habitFormShow && (
                <div className={styles.habitsForm}>
                    <h1 className={styles.fontWhite}>Add Habit</h1>

                    <select id="addHabitDropdown" className={`${styles.addHabitSelect} inter_font`}>
                        <option value="option1">Habit 1</option>
                        <option value="option2">Habit 2</option>
                        <option value="option3">Habit 3</option>
                    </select>

                    <button className='btnSecondaryDesktop'>Confirm</button>
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={handleHabitCancelClick}>
                        Cancel
                    </button>
                </div>
            )}

            {entryFormShow && (
                <div className={styles.habitsForm}>
                    <h1 className={styles.fontWhite}>Add Entry</h1>

                    <input type='number' placeholder={0} min={0} className={styles.sedEntry}></input>

                    <button className='btnSecondaryDesktop'>Confirm</button>
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={handleEntryCancelClick}>
                        Cancel
                    </button>
                </div>
            )}

            <div
                className={styles.container}
                style={{
                    // Set opacity to 50% when the forms are shown
                    opacity: habitFormShow || entryFormShow ? '50%' : '100%',
                    // Disable interactions when forms are shown
                    pointerEvents: habitFormShow || entryFormShow ? 'none' : 'auto',
                }}
            >
                <select id="habitDropdown" className={`${styles.habitSelect} inter_font`}>
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
                    <button className='btnPrimaryDesktop' onClick={handleAddEntryClick}>
                        Add Entry
                    </button>
                    <button className='btnSecondaryDesktop' onClick={handleAddHabitClick}>
                        Add Habit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HabitsPage