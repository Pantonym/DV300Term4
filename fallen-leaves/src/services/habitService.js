import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, doc, getDoc } from 'firebase/firestore';

// Collection reference
const usersCollection = 'users';

// Checks if the habit already exists in the user's subcollection
export const checkHabitExists = async (userId, habitName) => {
    try {
        const userHabitsRef = collection(db, usersCollection, userId, 'habits');
        const q = query(userHabitsRef, where('habitName', '==', habitName));
        const querySnapshot = await getDocs(q);

        return !querySnapshot.empty; // Return true if habit exists, false otherwise
    } catch (error) {
        console.error('Error checking if habit exists:', error);
        throw new Error('Failed to check habit');
    }
};

// Adds a new habit to the user's habits subcollection
export const addNewHabit = async (userId, habitName, habitGoal) => {
    try {
        const userHabitsRef = collection(db, usersCollection, userId, 'habits');

        // Add the new habit
        await addDoc(userHabitsRef, {
            habitName: habitName,
            habitGoal: habitGoal,
            entries: []
        });

        return true;
    } catch (error) {
        console.error('Error adding new habit:', error);
        throw new Error('Failed to add new habit');
    }
};

// Get the user's habits
export const getUserHabits = async (userId) => {
    try {
        const habitsRef = collection(db, 'users', userId, 'habits');
        const habitDocs = await getDocs(habitsRef);
        const habits = habitDocs.docs.map(doc => ({
            id: doc.id, // Document ID for the habit
            ...doc.data() // Habit data
        }));
        return habits;
    } catch (error) {
        console.error('Error fetching habits:', error);
        throw new Error('Failed to fetch habits');
    }
};

// Get a specific habit by its ID
export const getHabitById = async (userId, habitId) => {
    try {
        const habitRef = doc(db, 'users', userId, 'habits', habitId);
        const habitSnapshot = await getDoc(habitRef);

        // --Check if the habit exists
        if (habitSnapshot.exists()) {
            return { id: habitSnapshot.id, ...habitSnapshot.data() };
        } else {
            console.error('No habit found with the given ID');
            return null;
        }
    } catch (error) {
        console.error('Error fetching habit by ID:', error);
        throw error;
    }
};

// Add a new entry to the selected habit
export const addEntryToHabit = async (userId, habitId, entry) => {
    try {
        const habitDocRef = doc(db, 'users', userId, 'habits', habitId);
        await updateDoc(habitDocRef, {
            entries: arrayUnion(entry) // Add new entry to the existing array
        });
    } catch (error) {
        console.error('Error adding entry:', error);
        throw new Error('Failed to add entry');
    }
};

// Format the entries data to send to the AI's API
export const formatForApi = (habitData) => {
    // --Ensures the entries are an array
    const entries = Array.isArray(habitData.entries) ? habitData.entries : [];

    // --Structure the habit data in a more readable format to help the AI not become confused
    const formattedEntries = entries.map(entry => {
        const formattedDate = entry.date.toDate ? entry.date.toDate().toLocaleDateString() : entry.date; // ----Convert the Timestamp to a readable date
        return `Date: ${formattedDate}, Value: ${entry.value} ${entry.unit}`;
    }).join('\n');

    // --Format the habit data to be more readable for the API
    return `
    Habit Name: ${habitData.habitName}
    Habit Goal: ${habitData.habitGoal}
    Entries:
    ${formattedEntries}
    `;
};