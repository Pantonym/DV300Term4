import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, arrayUnion, doc  } from 'firebase/firestore';

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