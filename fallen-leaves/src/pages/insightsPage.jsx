import React, { useEffect, useState } from 'react'
import styles from './css/InsightsPage.module.css'
import PieChart from '../components/charts/PieChart'
import { Oval } from 'react-loader-spinner';
import { useAuth } from '../contexts/authContext';
import { getUserHabits } from '../services/habitService';
import { addInsight, getUserInsights } from '../services/insightsService';

function InsightsPage() {
    // Chart Data
    const [pieData1, setPieData1] = useState(null);
    const [pieData2, setPieData2] = useState(null);
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // User Data - not all variables are used, but may still be used later
    const { currentUser } = useAuth();
    const [userID, setUserID] = useState();
    const [habits, setHabits] = useState([]);
    const [insights, setInsights] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedHabitToDisplay, setSelectedHabitToDisplay] = useState('');
    const [selectedInsightToDisplay, setSelectedInsightToDisplay] = useState('');
    const [unit, setUnit] = useState('');
    const [goalProgress, setGoalProgress] = useState(null);

    // --Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid);
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

                // --Set the habit's entries & the proper unit of measurement
                setEntries(firstHabit.entries);
                setUnit(habitUnits[firstHabit.habitName]);

                // --Find an active insight for the selected habit
                const activeInsight = findActiveInsightForHabit(selectedHabitToDisplay.id, insights);
                setSelectedInsightToDisplay(activeInsight); // Store the active insight

                // --Generate pie chart data based on the habit entries and goals
                generatePieCharts(firstHabit);

                // // Format the data for the api
                // setFormattedData(formatForApi(firstHabit));
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
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                }]
            };
            setPieData1(pieChartData1);

            // --Create the second pie chart for the overall entries contribution
            // TODO: Only show a limited amount if the entries get too many
            const pieChartData2 = {
                labels: habit.entries.map((entry, index) => `Entry ${index + 1}`),
                datasets: [{
                    data: habit.entries.map(entry => parseFloat(entry.value)),
                    backgroundColor: habit.entries.map((_, index) =>
                        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                    ),
                    borderWidth: 1,
                }]
            };
            setPieData2(pieChartData2);

            setGoalProgress({ currentGoal, suggestedGoal });
            setLoading(false);
        }
    };

    // Habit Units
    const habitUnits = {
        recycling: 'kg',
        composting: 'kg',
        energyUsage: 'kWh',
        waterConservation: 'liters',
        reusableBags: 'count'
    };

    // --Handle habit change for the displaying of chart data
    const handleHabitDisplayChange = (e) => {
        const habitId = e.target.value;
        const selected = habits.find(habit => habit.id === habitId);
        setSelectedHabitToDisplay(selected);

        // // Format the data for the api
        // setFormattedData(formatForApi(selected));

        // Update entries based on the selected habit
        setEntries(selected ? selected.entries : []);

        // Set the unit based on the selected habit
        if (selected) {
            setUnit(habitUnits[selected.habitName]); // Use habitName to get the corresponding unit
        }

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
        <div className={styles.container}>
            {/* Choose which habit to display */}
            <select id="habitDropdown" className={`${styles.habitSelect} inter_font`} onChange={handleHabitDisplayChange}>
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

            <p className={styles.feedbackHolder}>
                {selectedInsightToDisplay && selectedInsightToDisplay.insightText
                    ? selectedInsightToDisplay.insightText
                    : 'No insights available for this habit.'}
            </p>
        </div>
    )
}

export default InsightsPage