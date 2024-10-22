import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { updateHabitEntries, updateHabitEntry, updateHabitGoal } from '../services/habitService';
import styles from './css/AllEntriesPage.module.css';
import { useAuth } from '../contexts/authContext';
import { Timestamp } from 'firebase/firestore';

function AllEntriesPage() {
    // Navigation
    const location = useLocation();
    // User Info
    const [habit, setHabit] = useState(location.state?.habit);
    const [entries, setEntries] = useState(habit ? habit.entries : []);
    const [editedEntries, setEditedEntries] = useState({});
    const [goal, setGoal] = useState(habit?.goal || '');
    const [userID, setUserID] = useState();
    const { currentUser } = useAuth();

    // Collect user info
    useEffect(() => {
        if (currentUser) {
            setUserID(currentUser.uid);
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
    }, [currentUser]);

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

    if (!habit) {
        return <p>No habit data available.</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.bodyBG}></div>

            <div style={{ textAlign: 'center' }}>
                <h1 className={styles.spaceForMobile}>{habit.habitName.charAt(0).toUpperCase() + habit.habitName.slice(1)}</h1>

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
                {/* TODO: Categorize table entries by the insight they are attached to */}
                <div className={styles.entriesSection}>
                    <h2>All Entries</h2>
                    <table className={styles.entriesTable}>
                        <thead>
                            <tr>
                                <th>Entry Date/Time</th>
                                <th>Entry Value</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AllEntriesPage;