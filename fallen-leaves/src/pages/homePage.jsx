import React, { useEffect, useState } from 'react'
import styles from './css/HomePage.module.css'
import BarChart from '../components/charts/BarChart'
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';

function HomePage() {
    // Form Controls
    const [entryFormShow, setEntryFormShow] = useState(false);
    const [habitFormShow, setHabitFormShow] = useState(false);
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // Navigation
    const navigate = useNavigate();
    // User Data
    const { currentUser } = useAuth();
    const [username, setUsername] = useState("USERNAME");
    const [barData1, setBarData1] = useState(null);

    // ENTRY FORM CONTROLS
    const handleAddEntryClick = () => {
        setEntryFormShow(true);
    };

    const handleEntryCancelClick = () => {
        setEntryFormShow(false);
    };

    // HABIT FORM CONTROLS
    const handleAddHabitClick = () => {
        setHabitFormShow(true);
    };

    const handleHabitCancelClick = () => {
        setHabitFormShow(false);
    };

    // Navigate to the insights page
    const handleNavigateInsightsPage = () => {
        navigate('/insights');
    }

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

        const fetchUsername = async () => {
            if (currentUser) {
                getUserProfile(currentUser.uid).then((data) => {
                    setUsername(data.username);
                }).catch(error => {
                    console.error('Error fetching profile info:', error);
                });
            }
        };

        fetchData1();
        fetchUsername();
    }, []);

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

                    <select id="habitDropdown" className={`${styles.habitSelect} inter_font`}>
                        <option value="option1">Habit 1</option>
                        <option value="option2">Habit 2</option>
                        <option value="option3">Habit 3</option>
                    </select>
                    <input type='number' placeholder={0} min={0} className={styles.sedEntry}></input>

                    <button className='btnSecondaryDesktop'>Confirm</button>
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={handleEntryCancelClick}>
                        Cancel
                    </button>
                </div>
            )}

            <div style={{
                // Set opacity to 50% when the forms are shown
                opacity: habitFormShow || entryFormShow ? '50%' : '100%',
                // Disable interactions when forms are shown
                pointerEvents: habitFormShow || entryFormShow ? 'none' : 'auto',
            }}>
                <h1 className='inter_font'>Welcome, {username}</h1>

                <div className={styles.cardHolder}>
                    <div className={styles.card} onClick={handleAddHabitClick}>
                        <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <button className={`${styles.headingButton} lora_font`} >
                            Add Habit
                        </button>
                    </div>

                    <div className={styles.card} onClick={handleAddEntryClick}>
                        <ion-icon name="add-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <button className={`${styles.headingButton} lora_font`}>
                            Add Entry
                        </button>
                    </div>

                    <div className={styles.card} onClick={handleNavigateInsightsPage}>
                        <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <button className={`${styles.headingButton} lora_font`}>
                            View Insights
                        </button>
                    </div>
                </div>

                <div className='hideOnMobile'>
                    <h1 className='inter_font'>Here are some insights on your habits:</h1>
                    {barData1 ? <BarChart chartData={barData1} /> : <p>Loading chart data...</p>}
                </div>
            </div>
        </div>
    )
}

export default HomePage