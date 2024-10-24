import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { updateHabitEntries, updateHabitGoal } from '../services/habitService';
import styles from './css/AllEntriesPage.module.css';
import { useAuth } from '../contexts/authContext';
import { Timestamp } from 'firebase/firestore';
import { getUserInsights } from '../services/insightsService';

function AllEntriesPage() {
    // Navigation
    const location = useLocation();
    // User Info
    const [habit, setHabit] = useState(location.state?.habit);
    const [insights, setInsights] = useState([]);
    const [entries, setEntries] = useState(habit ? habit.entries : []);
    const [editedEntries, setEditedEntries] = useState({});
    const [goal, setGoal] = useState(habit?.goal || '');
    const [userID, setUserID] = useState();
    const { currentUser } = useAuth();

    // Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid);
            const fetchData = async () => {
                const insights = await fetchHabitInsights();
                setInsights(insights);
            };

            fetchData();
        }

        // --Standardise dates to Firestore's Timestamp
        // --This is required because the date turns into a map with seconds and nanoseconds when passed to this page.
        if (habit && habit.entries) {
            const standardizedEntries = habit.entries.map(entry => {
                return {
                    ...entry,
                    date: entry.date.seconds
                        ? new Timestamp(entry.date.seconds, entry.date.nanoseconds)
                        : entry.date // ----If it's already a Timestamp, keep it as is
                };
            });

            setEntries(standardizedEntries);
        }
    }, [currentUser, habit]);

    // Fetch insights and filter those related to the selected habit
    const fetchHabitInsights = async () => {
        try {
            const allInsights = await getUserInsights(currentUser.uid); // Fetch all user insights
            const filteredInsights = allInsights.filter(insight => insight.userHabitID === habit.id);
            return filteredInsights;
        } catch (error) {
            console.error('Error fetching insights:', error);
            return [];
        }
    };

    // Handle changes to individual entries
    const handleEntryChange = (index, field, value) => {
        setEditedEntries({
            ...editedEntries,
            [index]: {
                ...editedEntries[index],
                [field]: value
            }
        });
    };

    // Save the updated entries
    const handleSaveEntries = async () => {
        try {
            // --Create a copy of the entries array to modify
            const updatedEntries = [...entries];

            for (const index in editedEntries) {
                // ----Find the original entry
                const originalEntry = updatedEntries[index];

                const updatedEntry = {
                    ...originalEntry,
                    value: editedEntries[index].value, // ------Only modify the value field
                    // ----Ensure the date is preserved as a Firestore Timestamp - just in case as it can be disastrous is allowd to be saved incorrectly.
                    date: originalEntry.date instanceof Timestamp
                        ? originalEntry.date
                        : new Timestamp(originalEntry.date.seconds, originalEntry.date.nanoseconds)
                };

                // ----Update the page's version of the entries array so it matches the db's
                updatedEntries[index] = updatedEntry;
            }

            // --Call the service function to update the entries in Firestore
            await updateHabitEntries(userID, habit.id, updatedEntries);

            setEntries(updatedEntries);  // Update the useState with the updated entries
            setEditedEntries({});        // Clear the editedEntries state since changes have been saved

            alert('Entries updated successfully!');
        } catch (error) {
            console.error('Error updating entries:', error);
            alert('An error occurred while updating the entries. Please try again.');
        }
    };

    // Handle changes to the habit goal
    const handleGoalChange = (e) => {
        setGoal(e.target.value);
    };

    // Save the updated goal
    const handleSaveGoal = async () => {
        try {
            await updateHabitGoal(userID, habit.id, goal);
            setHabit({ ...habit, goal });
            alert('Goal updated successfully!');
        } catch (error) {
            console.error('Error updating goal:', error);
            alert('An error occurred while updating the goal. Please try again.');
        }
    };

    // Group the entries by their linked insights
    const groupEntriesByInsight = () => {
        const groupedEntries = [];

        if (insights.length === 0) return [];

        // Loop through each insight and find associated entries
        insights.forEach((insight, index) => {
            const nextInsightDate = insights[index + 1]?.dateAdded.toDate(); // Get next insight's date for comparison
            const insightEntries = entries.filter(entry => {
                const entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date);
                const insightDate = insight.dateAdded.toDate();

                // Include entries made after the current insight but before the next insight
                return entryDate >= insightDate && (!nextInsightDate || entryDate < nextInsightDate);
            });

            groupedEntries.push({
                insight,
                entries: insightEntries
            });
        });

        return groupedEntries;
    };

    // SECTION: Function to convert camel case to title case
    const convertCamelCaseToTitle = (camelCaseStr) => camelCaseStr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

    if (!habit) {
        return <p>No habit data available.</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.bodyBG}></div>

            <div style={{ textAlign: 'center' }}>
                <h1 className={`${styles.spaceForMobile} ${styles.font_black}`}>{convertCamelCaseToTitle(habit.habitName)}</h1>

                {/* Edit the habit's goal */}
                <div className={styles.goalSection}>
                    <h2>Edit Habit Goal</h2>

                    <select id="addHabitDropdown" className={`${styles.addHabitSelect} lora_font`} onChange={handleGoalChange}>
                        <option value="">Select a Goal</option>
                        <option value="increase">Increase current value</option>
                        <option value="maintain">Maintain current value</option>
                        <option value="reduce">Reduce current value</option>
                    </select>

                    <button onClick={handleSaveGoal} className='btnPrimaryDesktop'>Save Goal</button>
                </div>

                {/* Edit the habit's entries */}
                <div className={styles.entriesSection}>
                    <h2 className={styles.font_black}>All Entries</h2>
                    <table className={styles.entriesTable}>
                        <thead>
                            <tr>
                                <th>Entry Date/Time</th>
                                <th>Entry Value</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupEntriesByInsight().map((group, groupIndex) => (
                                // React.Fragment is for logical grouping only - it is similar to a div but doesn't affect styling or hierarchy.
                                <React.Fragment key={group.insight.id}>
                                    {/* Render Insight Section */}
                                    <tr className={styles.insightRow}>
                                        <td colSpan="3">
                                            <strong>Insight: {group.insight.insightTitle}</strong> (Generated on: {new Date(group.insight.dateAdded.toDate()).toLocaleString()})
                                        </td>
                                    </tr>

                                    {/* Render Entries Associated with the Insight */}
                                    {group.entries.map((entry, index) => (
                                        <tr key={index}>
                                            <td>
                                                {entry.date.toDate ? new Date(entry.date.toDate()).toLocaleString() : new Date(entry.date).toLocaleString()}
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={editedEntries[index]?.value || entry.value}
                                                    onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                {editedEntries[index] ? (
                                                    <button onClick={handleSaveEntries}>Save</button>
                                                ) : (
                                                    'No changes'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AllEntriesPage;