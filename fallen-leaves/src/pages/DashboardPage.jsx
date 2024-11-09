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
import { addNewHabit, checkHabitExists, getUserHabits, getHabitById } from '../services/habitService';
// --Insight Service
import { getUserInsights } from '../services/insightsService';
// Habit info
import { defaultHabits, habitDescriptions, habitUnits } from '../constants/habitsData.js';

function DashboardPage() {
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
    const [username, setUsername] = useState("Username");
    const [habits, setHabits] = useState([]);
    // Chart Data
    const [barData, setBarData] = useState(null);
    const [donutData, setDonutData] = useState([]);
    // Display Data
    const [totalProgress, setTotalProgress] = useState(0);
    const [totalGoal, setTotalGoal] = useState(0);
    const [availableHabits, setAvailableHabits] = useState([]);

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
            chartData.labels = firstSixEntries.map(entry => {
                const entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date);
                return entryDate.toLocaleDateString();
            });
            chartData.datasets.push({
                label: convertCamelCaseToTitle(habit.habitName),
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

    // --Confirm adding a habit
    const handleHabitConfirmClick = async () => {
        // Check if a habit is selected
        if (selectedHabit === '') {
            alert('Please select a habit.');
            return;
        }

        try {
            console.log(userID);

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

    // SECTION: Filter Habits To Display
    useEffect(() => {
        const filteredHabits = defaultHabits.filter(
            defaultHabit => !habits.some(userHabit => userHabit.habitName === defaultHabit)
        );
        setAvailableHabits(filteredHabits);
    }, [habits]);

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

                        {availableHabits.length > 0 ? (
                            <select id="addHabitDropdown" className={`${styles.habitSelect} lora_font`} onChange={handleHabitChange}>
                                <option value="">Select a Habit</option>
                                {availableHabits.map(habit => (
                                    <option key={habit} value={habit}>
                                        {convertCamelCaseToTitle(habit)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p>No available habits to add.</p>
                        )}

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
                            <option value="increase">Increase current value</option>
                            <option value="maintain">Maintain current value</option>
                            <option value="reduce">Reduce current value</option>
                        </select>

                        <button className='btnPrimaryDesktop' onClick={handleHabitConfirmClick}>Confirm</button>
                        <button className='btnSecondaryDesktop' style={{ color: 'white' }} onClick={() => setHabitFormShow(false)}>
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
                                <p style={{ fontSize: '20px' }}>Welcome back to your dashboard, we're glad to see you! </p>
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
                                            labels: ['Completed %', ''],
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
                                <h1 className='inter_font'>How the entries of two of your habits compare:</h1>
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

                                <div className={styles.card} onClick={handleNavigateHabitsPage}>
                                    <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                                    <button className={`${styles.headingButton} lora_font`}>
                                        View Insights
                                    </button>
                                </div>
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

                <div className={styles.row} style={{ width: '100%', justifyContent: 'center' }}>
                    <a href="http://www.freepik.com" className={styles.backgroundLink}>Background Designed by pikisuperstar / Freepik</a>
                </div>

            </div>
        </div>
    )
}

export default DashboardPage