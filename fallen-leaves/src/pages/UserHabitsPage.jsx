// Default imports
import React, { useEffect, useState } from 'react'
import styles from './css/UserHabitsPage.module.css'
// Charts
import PieChart from '../components/charts/PieChart'
// Loader
import { Oval } from 'react-loader-spinner';
// Auth and navigation
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
// Service Functions
// --Habits Service
import { addEntryToHabit, addNewHabit, checkHabitExists, formatForApi, getUserHabits } from '../services/habitService';
// --Insights Service
import { addInsight, callOpenAiAPI, getUserInsights, updateInsight } from '../services/insightsService';

function UserHabitsPage() {
    // SECTION: HABITS PAGE USESTATES
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
    const [habits, setHabits] = useState([]);
    const [insights, setInsights] = useState([]);
    const [entries, setEntries] = useState([]);
    // Chart Data
    const [pieData1, setPieData1] = useState(null);
    const [pieData2, setPieData2] = useState(null);
    // Display Data
    const [unit, setUnit] = useState('');
    const [selectedHabitToDisplay, setSelectedHabitToDisplay] = useState('');
    const [selectedInsightToDisplay, setSelectedInsightToDisplay] = useState('');
    const [entryValue, setEntryValue] = useState(0);

    // SECTION: HABITS PAGE FUNCTIONS
    // Navigation function
    const handleViewAllEntries = () => {
        navigate('/allEntries', { state: { habit: selectedHabitToDisplay } });
    };

    // --Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid);
            fetchUserData(currentUser.uid);
        }
    }, [currentUser]);

    //  SECTION: Fetch the user's data
    const fetchUserData = async (uid) => {
        try {
            // Fetch insights and filter to get only those with completed == false
            const userInsights = await getUserInsights(uid);
            const activeInsights = userInsights.filter(insight => !insight.completed);
            setInsights(activeInsights);  // --Set only uncompleted insights

            // Fetch habits after insights are available
            const userHabits = await getUserHabits(uid);
            setHabits(userHabits); // --For display in the dropdown

            // Automatically set the first habit as the default selected habit
            if (userHabits.length > 0) {
                const firstHabit = userHabits[0];

                // --Find an active insight for the first habit
                const activeInsight = findActiveInsightForHabit(firstHabit.id, userInsights);
                setSelectedInsightToDisplay(activeInsight); // ----Store the active insight

                // --If there is an active insight, filter entries based on the insight's dateAdded field
                if (activeInsight) {
                    const insightDate = activeInsight.dateAdded.toDate(); // ----Convert Firestore Timestamp to Date

                    // ----Filter entries made after the insight's dateAdded
                    const filteredEntries = firstHabit.entries.filter(entry => {
                        const entryDate = entry.date.toDate ? entry.date.toDate() : entry.date;  // ------Handle Timestamp conversion
                        return entryDate > insightDate;  // ------Only include entries after the insight was created
                    });

                    // ----Set the filtered entries for the selected habit
                    setEntries(filteredEntries);
                } else {
                    // If there is no active insight, set all entries
                    setEntries(firstHabit.entries);
                }

                // --Set the selected habit
                setSelectedHabitToDisplay(firstHabit);

                // --Set the proper unit of measurement
                setUnit(habitUnits[firstHabit.habitName]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    // SECTION: HABIT FORM
    // Handle habit selection
    const handleHabitChange = (e) => {
        setSelectedHabit(e.target.value);
    };

    // Handle goal selection
    const handleGoalChange = (e) => {
        setSelectedGoal(e.target.value);
    };

    // Habit confirm click
    const handleHabitConfirmClick = async () => {
        // --Check if a habit is selected
        if (selectedHabit === '') {
            alert('Please select a habit.');
            return;
        }

        try {
            console.log(userID);

            // --Check if the habit already exists
            const habitExists = await checkHabitExists(userID, selectedHabit);
            if (habitExists) {
                alert('You already have this habit.');
                return;
            }

            // --Add the habit if it doesn't already exist
            await addNewHabit(userID, selectedHabit, selectedGoal);
            alert('Habit added successfully!');

            navigate(0);

            setHabitFormShow(false);
        } catch (error) {
            console.error('Error adding habit:', error);
            alert('An error occurred while adding the habit. Please try again.');
        }
    };

    // SECTION: ENTRY FORM
    // Entry value change
    const handleEntryValueChange = (e) => {
        setEntryValue(e.target.value);
    };

    // Add an entry
    const handleAddEntrySubmissionClick = async () => {
        console.log('Selected habit to display:', selectedHabitToDisplay);
        console.log('User ID:', userID);
        console.log('Habit ID:', selectedHabitToDisplay.id);

        if (!selectedHabitToDisplay || !selectedHabitToDisplay.id) {
            alert('Please select a habit first.');
            return;
        }

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

            // --Recalculate the current amount in the insights collection matching the active one
            if (selectedInsightToDisplay && selectedInsightToDisplay.id) {
                console.log("Updating Insight:", selectedInsightToDisplay.id);
                const newCurrent = selectedInsightToDisplay.current + parseFloat(entryValue);
                console.log('New Current:', newCurrent);

                // ----Update the current progress in the Firestore document for the insight
                await updateInsight(userID, selectedInsightToDisplay.id, { current: newCurrent });

                // ----If goal is completed, add the new entry and generate a new insight
                if (newCurrent >= selectedInsightToDisplay.suggestedGoal) {
                    // ----Update the local version of selectedHabitToDisplay
                    const updatedEntries = [...selectedHabitToDisplay.entries, newEntry];
                    const updatedHabit = {
                        ...selectedHabitToDisplay,
                        entries: updatedEntries,
                    };

                    // --Update the displayed entries for the selected habit
                    setEntries(updatedEntries);
                    setSelectedHabitToDisplay(updatedHabit); // Update the entire habit

                    // ----Add the entry to the Firestore document for the selected habit
                    await addEntryToHabit(userID, selectedHabitToDisplay.id, newEntry);

                    // ----Update the insight and generate a new one with the updated habit
                    await updateInsight(userID, selectedInsightToDisplay.id, { completed: true });
                    handleGenerateInsight(updatedHabit); // Pass the updated habit to ensure new entry is included
                } else {
                    // --Update the displayed entries for the selected habit
                    const updatedEntries = [...entries, newEntry];  // Store updated entries locally
                    const updatedHabit = {
                        ...selectedHabitToDisplay,
                        entries: updatedEntries,
                    };

                    // ----Update the local version of selectedHabitToDisplay
                    setEntries(updatedEntries);
                    setSelectedHabitToDisplay(updatedHabit); // Update the entire habit locally

                    // ----Add the entry to the Firestore document for the selected habit
                    await addEntryToHabit(userID, selectedHabitToDisplay.id, newEntry);
                    fetchUserData(currentUser.uid);
                }
            }

            setEntryFormShow(false); // ----Close the form

            alert('Entry added successfully!');
        } catch (error) {
            console.error('Error adding entry:', error);
            alert('An error occurred while adding the entry. Please try again.');
        }
    };

    // SECTION: Generate insights
    const handleGenerateInsight = async (updatedHabit = selectedHabitToDisplay) => {
        setLoading(true);
        try {
            // Ensure the habit data is formatted correctly for the API
            const formattedHabitData = formatForApi(updatedHabit);
            console.log(formattedHabitData);

            // Call the OpenAI API to generate insights
            const apiResponse = await callOpenAiAPI(formattedHabitData);
            console.log(apiResponse);

            // Extract the goal using regex
            const goalMatch = apiResponse.match(/\[GOAL:\s*(.*?)\]/);

            // If a goal is found, display it
            let extractedGoal = null;
            if (goalMatch && goalMatch[1]) {
                extractedGoal = parseInt(goalMatch[1], 10); // Convert the string to an integer
                console.log('Extracted Goal: ', extractedGoal);
            }

            // Extract the title using regex
            const titleMatch = apiResponse.match(/\[TITLE:\s*(.*?)\]/);

            // If a title is found, display it
            let extractedTitle = null;
            if (titleMatch && titleMatch[1]) {
                extractedTitle = titleMatch[1];
                console.log('Extracted Title: ', extractedTitle);
            }

            // If both title and goal were extracted, save the new insight to Firestore
            if (extractedGoal && extractedTitle) {
                await addInsight(
                    userID,
                    selectedHabitToDisplay.id,  // Habit ID
                    extractedTitle,  // Insight Title
                    apiResponse,  // Full response from OpenAI
                    extractedGoal,   // Goal from OpenAI
                    0                // Initial progress
                );
                console.log('New insight saved successfully!');
                // Fetch the data again to refresh the table
                fetchUserData(currentUser.uid);
            } else {
                console.log('An error occurred when extracting the goal & title');
            }

        } catch (error) {
            console.error('Error generating insight:', error);
        }
        setLoading(false);
    };

    // SECTION: ENTRIES TABLE
    // --Handle habit change for the displaying of entry data
    const handleHabitDisplayChange = (e) => {
        const habitId = e.target.value;
        const selected = habits.find(habit => habit.id === habitId);
        setSelectedHabitToDisplay(selected);

        // --Find an active insight for the selected habit
        const activeInsight = findActiveInsightForHabit(habitId, insights);
        setSelectedInsightToDisplay(activeInsight); // Store the active insight

        if (selected) {
            // --If there is an active insight, filter the entries based on the insight's dateAdded
            if (activeInsight) {
                const insightDate = activeInsight.dateAdded.toDate(); // ----Convert Firestore Timestamp to Date

                // ----Filter entries made after the insight's dateAdded
                const filteredEntries = selected.entries.filter(entry => {
                    const entryDate = entry.date.toDate ? entry.date.toDate() : entry.date;  // ------Handle Timestamp conversion
                    return entryDate > insightDate;  // ------Only include entries after the insight was created
                });

                // ----Set the filtered entries for the selected habit
                setEntries(filteredEntries);
            } else {
                // ----If there is no active insight, set all entries
                setEntries(selected.entries);
            }

            // --Set the unit based on the selected habit
            setUnit(habitUnits[selected.habitName]); // Use habitName to get the corresponding unit
        }
    }

    // SECTION: INSIGHTS PAGE FUNCTIONS
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

    // Listen for changes to the habits and the insights - then regenerate the pie charts
    useEffect(() => {
        if (selectedHabitToDisplay && insights.length > 0) {
            const activeInsight = findActiveInsightForHabit(selectedHabitToDisplay.id, insights);
            setSelectedInsightToDisplay(activeInsight);

            if (activeInsight) {
                generatePieCharts(selectedHabitToDisplay);
            }
        }
    }, [selectedHabitToDisplay, insights]);

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
            const filteredEntries = habit.entries.filter(entry => {
                const entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date);  // Check if it's a Firestore Timestamp or a Date string
                const insightDate = selectedInsightToDisplay.dateAdded.toDate();  // Assuming dateAdded is always a Timestamp
                return entryDate > insightDate;
            });

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

    // SECTION: Loader
    if (loading) {
        return (
            <div className="loadingContainer">
                <Oval color="#D75B30" height={80} width={80} />
                <p style={{ fontSize: '18px', marginLeft: '10px' }} className='lora_font'>Loading... <br></br> Please do not close or refresh this browser.</p>
            </div>
        );
    }

    return (
        <div>
            {/* SECTION: HABITS PAGE DISPLAY */}
            <div>
                <div className={styles.bodyBG}></div>
                {/* SECTION: FORM TO ADD A HABIT */}
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

                        <select id="addHabitDropdown" className={`${styles.habitSelect} lora_font`} onChange={handleGoalChange}>
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

                {/* FORM TO ADD AN ENTRY */}
                {entryFormShow && (
                    <div className={styles.habitsForm}>
                        <h1 className={styles.fontWhite}>Add Entry (in {unit})</h1>

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

                {/* DISPLAYING HABIT DROPDOWN AND TABLE */}
                <div
                    className={styles.container}
                    style={{
                        // Set opacity to 50% when the forms are shown
                        opacity: habitFormShow || entryFormShow ? '50%' : '100%',
                        // Disable interactions when forms are shown
                        pointerEvents: habitFormShow || entryFormShow ? 'none' : 'auto',
                    }}
                >
                    {/* TODO: Whenever user data is generated, set the first option to active */}
                    {/* Choose which habit to display */}
                    <select id="habitDropdown" className={`${styles.habitSelect} lora_font`} onChange={handleHabitDisplayChange}>
                        {habits.map(habit => (
                            <option key={habit.id} value={habit.id}>
                                {habit.habitName.charAt(0).toUpperCase() + habit.habitName.slice(1)}
                            </option>
                        ))}
                    </select>

                    {/* Display the entries of that habit */}
                    <table className={styles.table}>
                        <thead className='lora_font'>
                            <tr>
                                <th>Entry Date/Time</th>
                                <th>Entry Data</th>
                            </tr>
                        </thead>
                        <tbody className='inter_font'>
                            {entries.length > 0 ? (
                                entries.map((entry, index) => (
                                    <tr key={index}>
                                        <td>
                                            {entry.date.toDate ? new Date(entry.date.toDate()).toLocaleString() : new Date(entry.date).toLocaleString()}
                                        </td>
                                        <td>{entry.value} {entry.unit}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2">No entries for this habit.</td>
                                </tr>
                            )}

                            <tr>
                                <td colSpan="2" className={styles.btnRow}>
                                    <button className={styles.btnAllEntries} onClick={handleViewAllEntries}>
                                        View All Entries
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Add an entry or a habit buttons */}
                    <div className={styles.buttons}>
                        <button className='btnPrimaryDesktop' onClick={() => setEntryFormShow(true)}>
                            Add Entry
                        </button>
                        <button className='btnSecondaryDesktop' onClick={() => setHabitFormShow(true)}>
                            Add Habit
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION: INSIGHTS PAGE DISPLAY */}
            <div>
                <div className={styles.bodyBG}></div>
                <div className={styles.container}>
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
        </div>
    )
}

export default UserHabitsPage