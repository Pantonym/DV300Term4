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

function AccountPage() {
    // Enable navigation
    const navigate = useNavigate();
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // User Data
    const { logout, currentUser, getUserProfile } = useAuth();
    const [username, setUsername] = useState("USERNAME");
    const [donutData1, setDonutData1] = useState(null);
    const [donutData2, setDonutData2] = useState(null);

    useEffect(() => {
        // Simulate an API call to fetch data
        const fetchData1 = async () => {
            const dataFromAPI = {
                labels: ['Completed', 'Remaining'],
                datasets: [
                    {
                        label: 'Habit Completion',
                        data: [60, 40],
                        backgroundColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)'
                        ],
                        borderColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)'
                        ],
                        borderWidth: 1,
                    },
                ],
            };
            setDonutData1(dataFromAPI);
        };

        const fetchData2 = async () => {
            const dataFromAPI = {
                labels: ['Completed', 'Remaining'],
                datasets: [
                    {
                        label: 'Habit Completion',
                        data: [80, 20],
                        backgroundColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)',
                        ],
                        borderColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
            setDonutData2(dataFromAPI);
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
        fetchData2();
        fetchUsername();
        setLoading(false);
    }, []);

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

                {/* Will be automatically populated by a for loop */}
                <div className={styles.progressRow}>
                    <div className={styles.card}>
                        <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <h2>Habit Name</h2>
                    </div>

                    <div>
                        <img src={Arrow} className={styles.arrowImg} alt='ArrowImage' />
                    </div>

                    <div className={styles.progressCard}>
                        <div className={styles.donutChart}>
                            {donutData1 ? <DonutChart chartData={donutData1} /> : <p>Loading chart data...</p>}
                        </div>
                        <h2 className={styles.mobileHeading}>Habit Name</h2>
                    </div>
                </div>

                <div className={styles.progressRow}>
                    <div className={styles.card}>
                        <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        <h2>Habit Name</h2>
                    </div>

                    <div>
                        <img src={Arrow} className={styles.arrowImg} alt='ArrowImage' />
                    </div>

                    <div className={styles.progressCard}>
                        <div className={styles.donutChart}>
                            {donutData1 ? <DonutChart chartData={donutData2} /> : <p>Loading chart data...</p>}
                        </div>
                        <h2 className={styles.mobileHeading}>Habit Name</h2>
                    </div>
                </div>

                <button style={{ alignSelf: 'center' }} className="btnSecondaryDesktop" onClick={handleLogout}>Log Out</button>

            </div>
        </div>
    )
}

export default AccountPage