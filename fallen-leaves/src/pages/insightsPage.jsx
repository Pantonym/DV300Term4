import React, { useEffect, useState } from 'react'
import styles from './css/InsightsPage.module.css'
import PieChart from '../components/charts/PieChart'
import { Oval } from 'react-loader-spinner';
import { useAuth } from '../contexts/authContext';
import { getUserHabits } from '../services/habitService';
import { getUserInsights } from '../services/insightsService';

function InsightsPage() {
    // Chart Data
    const [pieData1, setPieData1] = useState(null);
    const [pieData2, setPieData2] = useState(null);
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // User Data - not all variables are used, but may still be used later
    const { currentUser } = useAuth();
    const [habits, setHabits] = useState([]);
    const [insights, setInsights] = useState([]);
    const [selectedHabitToDisplay, setSelectedHabitToDisplay] = useState('');
    const [selectedInsightToDisplay, setSelectedInsightToDisplay] = useState('');

    // --Acceptable colours for the graphs' backgrounds
    const graphColours = [
        'rgba(246, 180, 196, 0.6)', // Muted pink
        'rgba(178, 128, 167, 0.6)', // Muted purple
        'rgba(223, 200, 100, 0.6)', // Soft gold
        'rgba(78, 0, 57, 0.6)',     // Deep plum
        'rgba(231, 184, 123, 0.6)', // Warm beige
        'rgba(192, 132, 151, 0.6)', // Soft Rose
        'rgba(211, 149, 130, 0.6)', // Soft Coral
        'rgba(111, 76, 91, 0.6)',   // Deep Mulberry
        'rgba(236, 193, 119, 0.6)', // Warm Honey
        'rgba(255, 216, 168, 0.6)'  // Soft Peach
    ];

    // --Collect user info
    useEffect(() => {
        if (currentUser) {
            fetchUserHabits(currentUser.uid);
            fetchUserInsights(currentUser.uid);
        }
    }, [currentUser]);

    // Update the charts whenever the selected user habit changes:
    useEffect(() => {
        // --Get the relevant insight
        if (selectedHabitToDisplay && insights.length > 0) {
            const activeInsight = findActiveInsightForHabit(selectedHabitToDisplay.id, insights);
            setSelectedInsightToDisplay(activeInsight);
        }
    }, [selectedHabitToDisplay, insights]);

    // --Regenerate the charts
    useEffect(() => {
        if (selectedHabitToDisplay && selectedInsightToDisplay) {
            generatePieCharts(selectedHabitToDisplay);
        }
    }, [selectedHabitToDisplay, selectedInsightToDisplay]);

    // Collect user habits from the service
    const fetchUserHabits = async (uid) => {
        try {
            const userHabits = await getUserHabits(uid);
            setHabits(userHabits);

            // Automatically set the first habit as the default selected habit
            if (userHabits.length > 0) {
                const firstHabit = userHabits[0];
                setSelectedHabitToDisplay(firstHabit);

                // --Find an active insight for the selected habit
                const activeInsight = findActiveInsightForHabit(selectedHabitToDisplay.id, insights);
                setSelectedInsightToDisplay(activeInsight); // Store the active insight

                // --Generate pie chart data based on the habit entries and goals
                generatePieCharts(firstHabit);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    };

    // Collect user insights from the service
    const fetchUserInsights = async (uid) => {
        try {
            const userInsights = await getUserInsights(uid);
            setInsights(userInsights);
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    };

    // Find the insight that matches the active habit
    const findActiveInsightForHabit = (habitId, insights) => {
        // --Return null if no insights or habitId is provided
        if (!habitId || !insights || insights.length === 0) {
            return null;
        }

        // --Find the insight with matching habit ID and where completed is false
        const matchingInsight = insights.find(insight => insight.userHabitID === habitId && insight.completed === false);

        return matchingInsight || null;
    };

    // Generate pie chart data based on the habit's progress and goals
    const generatePieCharts = async (habit) => {
        if (habit && habit.entries.length > 0 && selectedInsightToDisplay) {
            // --Default to 0 if no data is available
            const currentGoal = selectedInsightToDisplay.current || 0;
            const suggestedGoal = selectedInsightToDisplay.suggestedGoal || 0;

            // --Check to see what percentage the user has completed of their goal
            const completionPercentage = (currentGoal / suggestedGoal) * 100;
            const remainingPercentage = 100 - completionPercentage;

            // --Create the first pie chart for habit progress based on the insight data
            const pieChartData1 = {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [completionPercentage, remainingPercentage],
                    backgroundColor: ['rgba(225, 173, 1, 0.6)', 'rgba(125, 5, 65, 0.6)'],
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1,
                }]
            };
            setPieData1(pieChartData1);

            // --Filter the entries based on the insight's dateAdded
            const filteredEntries = habit.entries.filter(entry => entry.date.toDate() > selectedInsightToDisplay.dateAdded.toDate());

            // --Create the second pie chart for the overall entries contribution after the dateAdded
            if (filteredEntries.length > 0) {
                const pieChartData2 = {
                    labels: filteredEntries.map((entry, index) => `Entry ${index + 1}`),
                    datasets: [{
                        data: filteredEntries.map(entry => parseFloat(entry.value)),
                        backgroundColor: filteredEntries.map((_, index) =>
                            // ----This allows the mapping to cycle through the list. This allows it to reuse colours if there are more entries than colours
                            graphColours[index % graphColours.length]
                        ),
                        borderColor: 'rgba(0, 0, 0, 1)',
                        borderWidth: 1,
                    }]
                };
                setPieData2(pieChartData2);
            } else {
                // --If there are no entries, set an empty dataset to render a blank chart
                const blankPieChartData = {
                    labels: ['No Entries Have Been Added Yet'],
                    datasets: [{
                        data: [1], // A single value for "No Data"
                        backgroundColor: ['rgba(215, 91, 48, 0.5)'], // Background for "No Data"
                        borderWidth: 0,
                    }]
                };
                setPieData2(blankPieChartData); // Set blank data for empty chart
            }

            setLoading(false);
        }
    };

    // --Handle habit change for the displaying of chart data
    const handleHabitDisplayChange = (e) => {
        const habitId = e.target.value;
        const selected = habits.find(habit => habit.id === habitId);
        setSelectedHabitToDisplay(selected);

        // Find an active insight for the selected habit
        const activeInsight = findActiveInsightForHabit(habitId, insights);
        setSelectedInsightToDisplay(activeInsight);
    }

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
            <div className={styles.container}>
                {/* Choose which habit to display */}
                <select id="habitDropdown" className={`lora_font`} onChange={handleHabitDisplayChange}>
                    {habits.map(habit => (
                        <option key={habit.id} value={habit.id}>
                            {habit.habitName.charAt(0).toUpperCase() + habit.habitName.slice(1)}
                        </option>
                    ))}
                </select>

                <div className={styles.pies}>
                    <div className={styles.pieChart}>
                        {pieData1 ? <PieChart chartData={pieData1} /> : <p>Loading chart data...</p>}
                    </div>
                    <span style={{ width: '50px', height: '50px' }}></span>
                    <div className={styles.pieChart}>
                        {pieData2 ? <PieChart chartData={pieData2} /> : <p>Loading chart data...</p>}
                    </div>
                </div>

                <p className={styles.feedbackHolder}
                    dangerouslySetInnerHTML={{
                        __html: selectedInsightToDisplay && selectedInsightToDisplay.insightText
                            ? selectedInsightToDisplay.insightText
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Make bold text
                                .replace(/\n/g, '<br>') // Insert line breaks
                            : 'No insights available for this habit.'
                    }}>
                </p>
            </div>
        </div>
    )
}

export default InsightsPage