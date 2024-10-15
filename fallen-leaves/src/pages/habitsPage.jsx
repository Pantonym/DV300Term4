import React, { useEffect, useState } from 'react'
import styles from './css/HabitsPage.module.css'
import { Oval } from 'react-loader-spinner';
import { addEntryToHabit, addNewHabit, checkHabitExists, formatForApi, getUserHabits } from '../services/habitService';
import { useAuth } from '../contexts/authContext';
import { addInsight, callOpenAiAPI, getUserInsights, updateInsight } from '../services/insightsService';

function HabitsPage() {
    // Form Control
    const [entryFormShow, setEntryFormShow] = useState(false);
    const [habitFormShow, setHabitFormShow] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [selectedGoal, setSelectedGoal] = useState('');
    // Loading Controller
    const [loading, setLoading] = useState(true);
    // User Info
    const { currentUser } = useAuth();
    const [userID, setUserID] = useState();
    const [habits, setHabits] = useState([]);
    const [insights, setInsights] = useState([]);
    const [entries, setEntries] = useState([]);
    const [selectedHabitToDisplay, setSelectedHabitToDisplay] = useState('');
    const [unit, setUnit] = useState('');
    const [entryValue, setEntryValue] = useState(0);
    const [selectedInsightToDisplay, setSelectedInsightToDisplay] = useState(''); // --Gets the active insight from the insights collection
    const [insight, setInsight] = useState(''); // --For the newly generated insight text form the api
    const [goal, setGoal] = useState('');
    const [title, setTitle] = useState('');

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

    // Listen for changes in selectedInsightToDisplay
    // This is because it is asynchronous and will not be set in time, so it has to be updated when the insight is ready.
    useEffect(() => {
        if (selectedInsightToDisplay) {
            console.log("Selected Insight has been updated:", selectedInsightToDisplay.insightTitle);
        }
    }, [selectedInsightToDisplay]); // --This will run whenever selectedInsightToDisplay is updated

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
        reusableBags: 'count'
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

                // If goal is completed, generate a new insight
                if (newCurrent >= selectedInsightToDisplay.suggestedGoal) {
                    await updateInsight(userID, selectedInsightToDisplay.id, { completed: true });
                    handleGenerateInsight(); // Call to generate a new insight
                }
            }

            // --Add the entry to the Firestore document for the selected habit
            await addEntryToHabit(userID, selectedHabitToDisplay.id, newEntry);

            // --Update the displayed entries for the selected habit
            setEntries([...entries, newEntry]);
            setEntryFormShow(false); // ----Close the form

            alert('Entry added successfully!');
        } catch (error) {
            console.error('Error adding entry:', error);
            alert('An error occurred while adding the entry. Please try again.');
        }
    };

    // SECTION: Generate insights
    const handleGenerateInsight = async () => {
        try {
            // Ensure the habit data is formatted correctly for the API
            const formattedHabitData = formatForApi(selectedHabitToDisplay);
            console.log(formattedHabitData);

            // Call the OpenAI API to generate insights
            const apiResponse = await callOpenAiAPI(formattedHabitData);
            console.log(apiResponse);

            // Extract the goal using regex
            const goalMatch = apiResponse.match(/\[GOAL:\s*(.*?)\]/);

            // If a goal is found, display it
            let extractedGoal = null;
            if (goalMatch && goalMatch[1]) {
                extractedGoal = goalMatch[1];
                setGoal(extractedGoal);
                console.log('Extracted Goal: ', extractedGoal);
            }

            // Extract the title using regex
            const titleMatch = apiResponse.match(/\[TITLE:\s*(.*?)\]/);

            // If a title is found, display it
            let extractedTitle = null;
            if (titleMatch && titleMatch[1]) {
                extractedTitle = titleMatch[1];
                setTitle(extractedTitle);
                console.log('Extracted Title: ', extractedTitle);
            }

            // Remove the goal and title lines from the response text
            const cleanedApiResponse = apiResponse
                .replace(/\[GOAL:\s*(.*?)\]/, '')    // Remove goal line
                .replace(/\[TITLE:\s*(.*?)\]/, '');  // Remove title line

            // If both title and goal were extracted, save the new insight to Firestore
            if (extractedGoal && extractedTitle) {
                await addInsight(
                    userID,
                    selectedHabitToDisplay.id,  // Habit ID
                    extractedTitle,  // Insight Title
                    cleanedApiResponse,  // Full response from OpenAI
                    extractedGoal,   // Goal from OpenAI
                    0                // Initial progress
                );
                console.log('New insight saved successfully!');
                // Fetch the data again to refresh the table
                fetchUserData(currentUser.uid);
            }

        } catch (error) {
            console.error('Error generating insight:', error);
        }
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
            {/* FORM TO ADD A HABIT */}
            {habitFormShow && (
                <div className={styles.habitsForm}>
                    <h1 className={styles.fontWhite}>Add Habit</h1>

                    {/* TODO: Future implementation, populate only with habits the user doesn't have */}
                    <select id="addHabitDropdown" className={`${styles.addHabitSelect} inter_font`} onChange={handleHabitChange}>
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
                        <div style={{ height: '25px', width: '1px' }}></div>
                    )}

                    <select id="addHabitDropdown" className={`${styles.addHabitSelect} inter_font`} onChange={handleGoalChange}>
                        <option value="">Select a Goal</option>
                        <option value="maintain">Maintain current value</option>
                        <option value="reduce">Reduce current value</option>
                    </select>

                    <button className='btnSecondaryDesktop' onClick={handleHabitConfirmClick}>Confirm</button>
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={() => setHabitFormShow(false)}>
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

                    <button className='btnSecondaryDesktop' onClick={handleAddEntrySubmissionClick}>Confirm</button>
                    <button className='btnPrimaryDesktop' style={{ color: 'white' }} onClick={() => setEntryFormShow(false)}>
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
                {/* Choose which habit to display */}
                <select id="habitDropdown" className={`${styles.habitSelect} inter_font`} onChange={handleHabitDisplayChange}>
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
    )
}

export default HabitsPage