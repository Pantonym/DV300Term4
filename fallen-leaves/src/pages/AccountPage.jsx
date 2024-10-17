import React, { useEffect, useState } from 'react'
import styles from './css/AccountPage.module.css'
import { Oval } from 'react-loader-spinner';
// Images
import Arrow from '../assets/Arrow.png'
// Charts
import DonutChart from '../components/charts/DonutChart';
// Authentication & Navigation
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userService';
import { getUserInsights } from '../services/insightsService';
import { getHabitById } from '../services/habitService';

function AccountPage() {
    // Enable navigation
    const navigate = useNavigate();
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // User Data
    const { logout, currentUser } = useAuth();
    const [username, setUsername] = useState("USERNAME");
    const [donutData, setDonutData] = useState([]);

    // --Collect user info
    useEffect(() => {
        if (currentUser) {
            fetchUserInsights(currentUser.uid);
            fetchUsername();

            setLoading(false);
        }
    }, [currentUser]);

    // fetch the user's insights
    const fetchUserInsights = async (uid) => {
        try {
            // --Get all user insights
            const userInsights = await getUserInsights(uid);

            // --Filter out completed insights
            const activeInsights = userInsights.filter(insight => !insight.completed);

            // --Initialize an array to store the chart data for each insight
            const donutDataArray = [];

            // --Fetch habit details for each active insight
            for (const insight of activeInsights) {
                const habitId = insight.userHabitID;

                // ----Fetch the habit using its ID
                const habit = await getHabitById(uid, habitId);

                // Convert camelCase to readable title format
                const formattedHabitName = convertCamelCaseToTitle(habit.habitName);

                // ----Prepare donut data for this habit based on the progress
                const chartData = {
                    labels: ['Completed', 'Remaining'],
                    datasets: [{
                        data: [insight.current, insight.suggestedGoal - insight.current],
                        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                        borderWidth: 1,
                    }]
                };

                // ----Save the formatted habit name and chart data
                donutDataArray.push({
                    habitName: formattedHabitName, // ------Use formatted habit name
                    chartData,
                });
            }

            // Save the donut data to useState
            setDonutData(donutDataArray);
        } catch (error) {
            console.error('Error fetching habits or insights:', error);
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

    // Converts the camelCase titles to title case
    const convertCamelCaseToTitle = (camelCaseStr) => {
        const words = camelCaseStr.match(/[A-Z][a-z]+|[a-z]+/g);
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Confirm is the user wants to log out, and if they do log out and navigate to the login page
    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to log out?');

        if (confirmed) {
            try {
                await logout();
                console.log('Successfully logged out');
                navigate('/login');
            } catch (error) {
                console.error('Logout Error:', error);
            }
        } else {
            console.log('Logout canceled');
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
        <div className={styles.container}>
            <div>
                <div className={styles.profileImage}></div>
                <h1 className={styles.blackFont}>{username}</h1>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressRow}>
                    <h2 className={`${styles.blackFont} hideOnMobile`}>Habits</h2>
                    <h2 className={styles.blackFont}>Progress</h2>
                </div>

                {/* Dynamically render progress rows for each habit and its corresponding donut chart */}
                {donutData.map((data, index) => (
                    <div className={styles.progressRow} key={index}>
                        <div className={styles.card}>
                            <ion-icon name="clipboard-outline" style={{ fontSize: '50px', color: 'white' }}></ion-icon>
                            <h2>{data.habitName}</h2> {/* Formatted habit name */}
                        </div>

                        <div>
                            <img src={Arrow} className={styles.arrowImg} alt='ArrowImage' />
                        </div>

                        <div className={styles.progressCard}>
                            <div className={styles.donutChart}>
                                <DonutChart chartData={data.chartData} />
                            </div>
                            <h2 className={styles.mobileHeading}>{data.habitName}</h2> {/* Formatted habit name */}
                        </div>
                    </div>
                ))}

                <button style={{ alignSelf: 'center' }} className="btnSecondaryDesktop" onClick={handleLogout}>Log Out</button>

            </div>
        </div>
    )
}

export default AccountPage