import React, { useEffect, useState } from 'react'
import styles from './css/HomePage.module.css'
import BarChart from '../components/charts/BarChart'
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import { getUserHabits } from '../services/habitService';

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
    const [barData, setBarData] = useState(null);

    // Navigate to the insights page
    const handleNavigateInsightsPage = () => {
        navigate('/insights');
    }

    useEffect(() => {
        const fetchUserHabitsData = async () => {
            if (currentUser) {
                try {
                    // TODO: Scaling based on the data set with the smallest numbers
                    // TODO: Change labels to include the units each item is made of
                    const userHabits = await getUserHabits(currentUser.uid);

                    // Use only the first two habits
                    const firstTwoHabits = userHabits.slice(0, 2);

                    // Prepare the data for the BarChart
                    const chartData = {
                        labels: [],
                        datasets: []
                    };

                    // Loop through the first two habits
                    firstTwoHabits.forEach((habit, index) => {
                        // --Take the first 6 entries from each habit
                        const firstSixEntries = habit.entries.slice(0, 6);

                        // --Create labels from the entry dates
                        const labels = firstSixEntries.map(entry =>
                            new Date(entry.date.toDate ? entry.date.toDate() : entry.date).toLocaleDateString()
                        );

                        // --Add to chart data
                        chartData.labels = labels;
                        chartData.datasets.push({
                            label: habit.habitName,
                            data: firstSixEntries.map(entry => entry.value),
                            backgroundColor: index === 0 ? 'rgba(209, 90, 78, 1)' : 'rgba(242, 160, 123, 1)',
                            borderColor: index === 0 ? 'rgba(209, 90, 78, 1)' : 'rgba(242, 160, 123, 1)',
                            borderWidth: 1,
                        });
                    });

                    setBarData(chartData);
                } catch (error) {
                    console.error('Error fetching habits:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserHabitsData();

        const fetchUsername = async () => {
            if (currentUser) {
                getUserProfile(currentUser.uid).then((data) => {
                    setUsername(data.username);
                }).catch(error => {
                    console.error('Error fetching profile info:', error);
                });
            }
        };


        fetchUsername();
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
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={() => setHabitFormShow(false)}>
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
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={() => setEntryFormShow(false)}>
                        Cancel
                    </button>
                </div>
            )}

            <div style={{
                // --Set opacity to 50% when the forms are shown
                opacity: habitFormShow || entryFormShow ? '50%' : '100%',
                // --Disable interactions when forms are shown
                pointerEvents: habitFormShow || entryFormShow ? 'none' : 'auto',
            }}>
                <h1 className='inter_font'>Welcome, {username}</h1>

                <div className={styles.cardHolder}>
                    <div className={styles.card} onClick={() => setHabitFormShow(true)}>
                        <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <button className={`${styles.headingButton} lora_font`} >
                            Add Habit
                        </button>
                    </div>

                    <div className={styles.card} onClick={() => setEntryFormShow(true)}>
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
                    {barData ? <BarChart chartData={barData} /> : <p>Loading chart data...</p>}
                </div>
            </div>
        </div>
    )
}

export default HomePage