// Default imports
import React, { useEffect, useState } from 'react'
import styles from './css/DashboardPage.module.css'
// Charts
import DonutChart from '../components/charts/DonutChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
// Loader
import { Oval } from 'react-loader-spinner';
// Images
import welcomeImage from '../assets/dashboardImage.png';
// Auth and Navigation
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
// Service Functions
// --User Service
import { getUserProfile } from '../services/userService';
// --Habit Service
import { addEntryToHabit, addNewHabit, checkHabitExists, getUserHabits, getHabitById } from '../services/habitService';
// --Insight Service
import { getUserInsights } from '../services/insightsService';

function DashboardPage() {
    // Form Controls
    const [entryFormShow, setEntryFormShow] = useState(false);
    const [habitFormShow, setHabitFormShow] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [selectedGoal, setSelectedGoal] = useState('');
    const [entryValue, setEntryValue] = useState(0);
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // Navigation
    const navigate = useNavigate();
    // User Data
    const { currentUser } = useAuth();
    const [userID, setUserID] = useState();
    const [username, setUsername] = useState("Username");
    const [habits, setHabits] = useState([]);
    const [entries, setEntries] = useState([]);
    // Chart Data
    const [barData, setBarData] = useState(null);
    const [donutData, setDonutData] = useState([]);
    // Display Data
    const [unit, setUnit] = useState('');
    const [selectedHabitToAddEntry, setSelectedHabitToAddEntry] = useState('')
    const [totalProgress, setTotalProgress] = useState(0);
    const [totalGoal, setTotalGoal] = useState(0);

    // SECTION: Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid); // Collect the uID
            fetchUserInsights(currentUser.uid); // Gather the user's insights & set the appropriate chart data
            fetchUserHabits(currentUser.uid); // Gather the user's habits & set the appropriate chart data
            fetchUsername(); // Collect the username
        }
    }, [currentUser]);

    // SECTION: Fetch the user's insights
    const fetchUserInsights = async (uid) => {
        try {
            // --Get all user insights
            const userInsights = await getUserInsights(uid);

            // --Filter out completed insights
            const activeInsights = userInsights.filter(insight => !insight.completed);

            // Calculate total progress and total goals
            let totalCurrentProgress = 0;
            let totalGoals = 0;

            // Set the donut chart data
            const donutDataArray = await Promise.all(
                activeInsights.map(async insight => {
                    const habit = await getHabitById(uid, insight.userHabitID);

                    totalCurrentProgress += insight.current;
                    totalGoals += insight.suggestedGoal;

                    return {
                        habitName: convertCamelCaseToTitle(habit.habitName),
                        chartData: {
                            labels: ['Completed', 'Remaining'],
                            datasets: [{
                                data: [insight.current, insight.suggestedGoal - insight.current],
                                backgroundColor: ['rgba(225, 173, 1, 0.6)', 'rgba(125, 5, 65, 0.6)'],
                                borderColor: ['rgba(225, 173, 1, 1)', 'rgba(125, 5, 65, 1)'],
                                borderWidth: 1,
                            }]
                        }
                    };
                })
            );
            setDonutData(donutDataArray);

            if (totalGoals > 0) {
                const progressPercentage = (totalCurrentProgress / totalGoals) * 100;
                const remainingPercentage = ((totalGoals - totalCurrentProgress) / totalGoals) * 100;

                // Set the percentages
                setTotalProgress(progressPercentage.toFixed(2));
                setTotalGoal(remainingPercentage.toFixed(2));
            } else {
                console.error('Total goals cannot be zero.');
            }
        } catch (error) {
            console.error('Error fetching habits or insights:', error);
        }
    };

    // SECTION: Fetch the user's habits
    const fetchUserHabits = async () => {
        if (currentUser) {
            try {
                // --Get the user's habits
                const userHabits = await getUserHabits(currentUser.uid);
                setHabits(userHabits);

                // --Default habit selection
                if (userHabits.length > 0) {
                    setSelectedHabitToAddEntry(userHabits[0]);
                    setUnit(habitUnits[userHabits[0].habitName]);
                }

                // Create the bar chart data
                const chartData = createBarChartData(userHabits.slice(0, 2));
                setBarData(chartData);
            } catch (error) {
                console.error('Error fetching habits:', error);
            } finally {
                setLoading(false);
            }

        }
    };

    // --Function to create the bar chart's data from the supplied habits
    const createBarChartData = (habits) => {
        const chartData = { labels: [], datasets: [] };
        habits.forEach((habit, index) => {
            const firstSixEntries = habit.entries.slice(0, 6);
            chartData.labels = firstSixEntries.map(entry => new Date(entry.date).toLocaleDateString());
            chartData.datasets.push({
                label: habit.habitName,
                data: firstSixEntries.map(entry => entry.value),
                backgroundColor: index === 0 ? 'rgba(178, 128, 167, 1)' : 'rgba(242, 160, 123, 1)',
                borderColor: index === 0 ? 'rgba(178, 128, 167, 1)' : 'rgba(242, 160, 123, 1)',
                borderWidth: 1,
            });
        });
        return chartData;
    };

    // SECTION: Get the user's username
    const fetchUsername = async () => {
        if (currentUser) {
            getUserProfile(currentUser.uid).then((data) => {
                setUsername(data.username);
            }).catch(error => {
                console.error('Error fetching profile info:', error);
            });
        }
    };

    // SECTION: Function to convert camel case to title case
    const convertCamelCaseToTitle = (camelCaseStr) => camelCaseStr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    // SECTION: NAVIGATION
    // --Navigates to the habits page
    const handleNavigateHabitsPage = () => {
        navigate('/habits');
    }

    // SECTION: HABIT FORM INPUT CONTROLS
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

    // --Confirm adding a habit
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

    // SECTION: HABIT LORE
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

    // SECTION: ENTRY FORM
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

    // SECTION Loader
    if (loading) {
        return (
            <div className="loadingContainer">
                <Oval color="#D75B30" height={80} width={80} />
            </div>
        );
    }

    // SECTION: Display
    return (
        <div>
            <div className={styles.bodyBG}></div>

            {/* SECTION: HOME PAGE DIVS */}
            <div>
                {/* FORM TO ADD A HABIT */}
                {habitFormShow && (
                    <div className={styles.habitsForm}>
                        <h1 className={styles.fontWhite}>Add Habit</h1>

                        {/* TODO: Future implementation, populate only with habits the user doesn't have */}
                        <select id="addHabitDropdown" className={`${styles.habitSelect} lora_font`} onChange={handleHabitChange}>
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

                        <select id="addHabitDropdown" className={`${styles.habitSelect} inter_font`} onChange={handleGoalChange}>
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
                    <div className={styles.row} style={{ justifyContent: 'space-between', marginBottom: '25px' }}>
                        <div className={styles.welcomeCard}>
                            <div className={styles.column}>
                                <h1 className={styles.blackFont}>Hi, {username}</h1>
                                <p style={{ fontSize: '20px' }}>Welcome back to your dashboard, we're glad to see you again! </p>
                                <p style={{ fontSize: '18px' }}>With Fallen Leaves you can track your habits, log entries, and gain insights into your progress. You can add new habits, monitor your improvements, and receive achievable goals based on personalized insights. Let's get started!</p>
                            </div>

                            <div className={`${styles.column} hideOnMobile`}>
                                <img src={welcomeImage} className={styles.welcomeImage} alt='Person Watering Plant' />
                            </div>
                        </div>

                        <div className={styles.totalGoalProgressCard}>
                            <h2 style={{ maxWidth: '350px', marginTop: '0px' }}>Your total progress to all of your goals:</h2>
                            <div className={styles.totalGoalsChart}>
                                {totalProgress > 0 && totalGoal > 0 && (
                                    <PieChart
                                        chartData={{
                                            labels: ['', ''],
                                            datasets: [{
                                                data: [totalProgress, totalGoal],
                                                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                                                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                                                borderWidth: 1,
                                            }]
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.row} style={{ justifyContent: 'space-between', marginBottom: '25px' }}>
                        <div className={`${styles.column} hideOnMobile`}>
                            <div className={styles.barChartCard}>
                                <h1 className='inter_font'>Here are some insights on your habits:</h1>
                                {barData ? <BarChart chartData={barData} /> : <p>Loading chart data...</p>}
                            </div>
                        </div>

                        <div className={styles.column} style={{ justifyContent: 'center' }}>
                            <div className={styles.row}>
                                <div className={styles.card} onClick={() => setHabitFormShow(true)}>
                                    <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                                    <button className={`${styles.headingButton} lora_font`} >
                                        Add Habit
                                    </button>
                                </div>

                                <div className={styles.card} style={{ marginRight: '0px' }} onClick={() => setEntryFormShow(true)}>
                                    <ion-icon name="add-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                                    <button className={`${styles.headingButton} lora_font`}>
                                        Add Entry
                                    </button>
                                </div>
                            </div>

                            <div className={styles.card} onClick={handleNavigateHabitsPage}>
                                <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                                <button className={`${styles.headingButton} lora_font`}>
                                    View Insights
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.progressContainer}>
                            <h1>Here is how close you are to each of your goals:</h1>

                            <div className={styles.row} style={{ justifyContent: 'space-between' }}>
                                {/* Dynamically render progress rows for each habit and its corresponding donut chart */}
                                {donutData.map((data, index) => (
                                    <div key={index}>
                                        <div className={styles.progressCard}>
                                            <h2>{data.habitName}</h2> {/* Formatted habit name */}
                                            <div className={styles.donutChart}>
                                                <DonutChart chartData={data.chartData} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* <a href="http://www.freepik.com" className={styles.backgroundLink}>Background Designed by pikisuperstar / Freepik</a> */}
            </div>
        </div>
    )
}

export default DashboardPage