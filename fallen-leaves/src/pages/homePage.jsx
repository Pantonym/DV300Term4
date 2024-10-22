import React, { useEffect, useState } from 'react'
import styles from './css/HomePage.module.css'
import BarChart from '../components/charts/BarChart'
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import { addEntryToHabit, addNewHabit, checkHabitExists, getUserHabits } from '../services/habitService';

function HomePage() {
    // Form Controls
    const [entryFormShow, setEntryFormShow] = useState(false);
    const [habitFormShow, setHabitFormShow] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [selectedGoal, setSelectedGoal] = useState('');
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // Navigation
    const navigate = useNavigate();
    // User Data
    const { currentUser } = useAuth();
    const [userID, setUserID] = useState();
    const [username, setUsername] = useState("USERNAME");
    const [barData, setBarData] = useState(null);
    const [unit, setUnit] = useState('');
    const [habits, setHabits] = useState([]);
    const [entries, setEntries] = useState([]);
    const [entryValue, setEntryValue] = useState(0);
    const [selectedHabitToAddEntry, setSelectedHabitToAddEntry] = useState('')

    // Navigate to the insights page
    const handleNavigateInsightsPage = () => {
        navigate('/insights');
    }

    // HABIT FORM
    // --Handle habit selection
    const handleHabitChange = (e) => {
        setSelectedHabit(e.target.value);
    };

    // --Handle goal selection
    const handleGoalChange = (e) => {
        setSelectedGoal(e.target.value);
    };

    // --Entry form habit select
    const handleHabitSelect = (e) => {
        const selectedHabit = habits.find(habit => habit.id === e.target.value);
        setSelectedHabitToAddEntry(selectedHabit);
        setUnit(habitUnits[selectedHabit.habitName]);
    };

    // HABIT LORE
    // --Habit Descriptions
    const habitDescriptions = {
        recycling: 'Recycling helps reduce waste by converting materials into reusable objects.',
        composting: 'Composting turns organic waste into valuable fertilizer for your garden.',
        energyUsage: 'Energy conservation reduces your carbon footprint and saves on utility bills.',
        waterConservation: 'Saving water helps preserve our planet`s most vital resource.',
        reusableBags: 'Using reusable bags reduces plastic waste and pollution.',
    };
    // --Habit Units
    const habitUnits = {
        recycling: 'kg',
        composting: 'kg',
        energyUsage: 'kWh',
        waterConservation: 'liters',
        reusableBags: 'bags'
    };

    // --Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid);
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchUserHabitsData = async () => {
            if (currentUser) {
                try {
                    // TODO: Scaling based on the data set with the smallest numbers
                    // TODO: Change labels to include the units each item is made of
                    const userHabits = await getUserHabits(currentUser.uid);
                    setHabits(userHabits);

                    // --Default habit selection
                    if (userHabits.length > 0) {
                        setSelectedHabitToAddEntry(userHabits[0]);
                        setUnit(habitUnits[userHabits[0].habitName]);
                    }

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
                            backgroundColor: index === 0 ? 'rgba(178, 128, 167, 1)' : 'rgba(242, 160, 123, 1)',
                            borderColor: index === 0 ? 'rgba(178, 128, 167, 1)' : 'rgba(242, 160, 123, 1)',
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

        const fetchUsername = async () => {
            if (currentUser) {
                getUserProfile(currentUser.uid).then((data) => {
                    setUsername(data.username);
                }).catch(error => {
                    console.error('Error fetching profile info:', error);
                });
            }
        };

        fetchUserHabitsData();
        fetchUsername();
        setLoading(false);
    }, []);

    // --Habit confirm click
    const handleHabitConfirmClick = async () => {
        // Check if a habit is selected
        if (selectedHabit === '') {
            alert('Please select a habit.');
            return;
        }

        try {
            console.log(userID);

            // TODO: Only show habits the user doesn't have
            // Check if the habit already exists
            const habitExists = await checkHabitExists(userID, selectedHabit);
            if (habitExists) {
                alert('You already have this habit.');
                return;
            }

            // Add the habit if it doesn't already exist
            await addNewHabit(userID, selectedHabit, selectedGoal);
            alert('Habit added successfully!');
            setHabitFormShow(false);
        } catch (error) {
            console.error('Error adding habit:', error);
            alert('An error occurred while adding the habit. Please try again.');
        }
    };

    // ENTRY FORM
    // --Entry value change
    const handleEntryValueChange = (e) => {
        setEntryValue(e.target.value);
    };

    // --Add an entry
    const handleAddEntrySubmissionClick = async () => {
        console.log('User ID:', userID);
        console.log('Habit ID:', selectedHabitToAddEntry.id);

        if (entryValue <= 0) {
            alert('Please enter a valid number.');
            return;
        }

        try {
            const newEntry = {
                date: new Date(),
                value: entryValue,
                unit: unit
            };

            // Add the entry to the Firestore document for the selected habit
            await addEntryToHabit(userID, selectedHabitToAddEntry.id, newEntry);

            // Update the displayed entries for the selected habit
            setEntries([...entries, newEntry]);
            setEntryFormShow(false); // Close the form
            alert('Entry added successfully!');
        } catch (error) {
            console.error('Error adding entry:', error);
            alert('An error occurred while adding the entry. Please try again.');
        }
    };

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
            <div className={styles.bodyBG}></div>
            <div>
                {/* FORM TO ADD A HABIT */}
                {habitFormShow && (
                    <div className={styles.habitsForm}>
                        <h1 className={styles.fontWhite}>Add Habit</h1>

                        {/* TODO: Future implementation, populate only with habits the user doesn't have */}
                        <select id="addHabitDropdown" className={`${styles.addHabitSelect} lora_font`} onChange={handleHabitChange}>
                            <option value="">Select a Habit</option>
                            <option value="recycling">Recycling</option>
                            <option value="composting">Composting</option>
                            <option value="energyUsage">Energy Usage</option>
                            <option value="waterConservation">Water Conservation</option>
                            <option value="reusableBags">Reusable Bags</option>
                        </select>

                        {/* Description of the selected habit */}
                        {selectedHabit ? (
                            <p className={styles.habitDescription}>
                                {habitDescriptions[selectedHabit]}
                            </p>
                        ) : (
                            // Spacer that stops rendering when the text is visible
                            <div className={styles.addHabitSpacer}></div>
                        )}

                        <select id="addHabitDropdown" className={`${styles.addHabitSelect} inter_font`} onChange={handleGoalChange}>
                            <option value="">Select a Goal</option>
                            <option value="maintain">Maintain current value</option>
                            <option value="reduce">Reduce current value</option>
                        </select>

                        <button className='btnPrimaryDesktop' onClick={handleHabitConfirmClick}>Confirm</button>
                        <button className='btnSecondaryDesktop' style={{ color: 'white' }} onClick={() => setHabitFormShow(false)}>
                            Cancel
                        </button>
                    </div>
                )}

                {/* FORM TO ADD AN ENTRY */}
                {entryFormShow && (
                    <div className={styles.habitsForm}>
                        <h1 className={styles.fontWhite}>Add Entry (in {unit})</h1>

                        {/* Dropdown to select habit */}
                        <select
                            value={selectedHabitToAddEntry ? selectedHabitToAddEntry.id : ''}
                            onChange={handleHabitSelect}
                            className={`${styles.habitSelect} lora_font`}
                        >
                            {habits.map(habit => (
                                <option key={habit.id} value={habit.id}>
                                    {habit.habitName.charAt(0).toUpperCase() + habit.habitName.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Input field for the entry value */}
                        <input
                            type='number'
                            value={entryValue}
                            placeholder={0}
                            min={0}
                            onChange={handleEntryValueChange}
                            className={styles.sedEntry}
                        />

                        <button className='btnPrimaryDesktop' onClick={handleAddEntrySubmissionClick}>Confirm</button>
                        <button className='btnSecondaryDesktop' style={{ color: 'white' }} onClick={() => setEntryFormShow(false)}>
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
                        <div className={styles.card} style={{ backgroundColor: '#7d0541' }} onClick={() => setHabitFormShow(true)}>
                            <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                            <button className={`${styles.headingButton} lora_font`} >
                                Add Habit
                            </button>
                        </div>

                        <div className={styles.card} style={{ backgroundColor: '#7d0541' }} onClick={() => setEntryFormShow(true)}>
                            <ion-icon name="add-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                            <button className={`${styles.headingButton} lora_font`}>
                                Add Entry
                            </button>
                        </div>

                        <div className={styles.card} style={{ backgroundColor: '#7d0541' }} onClick={handleNavigateInsightsPage}>
                            <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                            <button className={`${styles.headingButton} lora_font`}>
                                View Insights
                            </button>
                        </div>
                    </div>

                    <div className='hideOnMobile'>
                        <h1 className='inter_font'>Here are some insights on your habits:</h1>
                        <div className={styles.barChartCard}>
                            {barData ? <BarChart chartData={barData} /> : <p>Loading chart data...</p>}
                        </div>
                    </div>
                </div>

                {/* <a href="http://www.freepik.com" className={styles.backgroundLink}>Background Designed by pikisuperstar / Freepik</a> */}
            </div>
        </div>
    )
}

export default HomePage