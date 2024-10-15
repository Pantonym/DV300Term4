import { addDoc, collection, doc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Applying retry strategy to Axios for handling rate limit responses
axiosRetry(axios, {
    retries: 3,
    retryCondition: (error) => error.response && error.response.status === 429, // Retry only on 429
    retryDelay: (retryCount) => retryCount * 2000 // Retry after an increasing delay (2 seconds)
});

// API Key
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

// Open AI Base url
const API_URL = 'https://api.openai.com/v1/completions';

// Call the AI to create insights
export const callOpenAiAPI = async (habitData) => {
    try {
        const prompt = `Analyze the following habit data and provide insights. At the end, provide an attainable goal enclosed in the format [GOAL: integer]. In addition, provide a suitable title in the following format [TITLE: string]. Data: ${habitData}`;

        if (!apiKey) {
            throw new Error("API key is missing. Please check your environment variables.");
        }

        const response = await axios.post(API_URL, {
            model: 'gpt-4o-mini', // Use the gpt-4o-mini model
            prompt: prompt,
            max_tokens: 100, // The maximum amount of tokens usable for this request
            temperature: 0.5, // Controls creativity/randomness
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return response.data.choices[0].text; // Extract the response's text
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Rate limit exceeded. Please wait and try again.');
        } else {
            console.error('Error calling OpenAI API:', error);
        }
    }
};

// Function to add an insight for the user
export const addInsight = async (userId, userHabitID, insightTitle, insightText, suggestedGoal, currentProgress) => {
    try {
        // --Reference to the user's insights subcollection
        const insightsRef = collection(db, 'users', userId, 'insights');

        // --Prepare the new insight object
        const newInsight = {
            userHabitID: userHabitID,
            insightTitle: insightTitle,
            insightText: insightText,
            suggestedGoal: suggestedGoal,
            dateAdded: Timestamp.now(),
            current: currentProgress,
            completed: false // ----Will only turn true once the goal is reached - then a new insight will be generated
        };

        // --Add the new insight document to Firestore
        const insightDocRef = await addDoc(insightsRef, newInsight);

        console.log('Insight added with ID:', insightDocRef.id);
        return insightDocRef.id; // Return the newly created insight ID
    } catch (error) {
        console.error('Error adding insight:', error);
        throw new Error('Failed to add insight');
    }
};

// Function to get the user's insights
export const getUserInsights = async (userId) => {
    try {
        // --Reference to the insights subcollection for the specific user
        const insightsRef = collection(db, 'users', userId, 'insights');

        // --Fetch all documents from the insights collection
        const insightsSnapshot = await getDocs(insightsRef);

        // --Map through the snapshot and return an array of insights
        const userInsights = insightsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return userInsights;
    } catch (error) {
        console.error('Error fetching user insights:', error);
        throw new Error('Failed to fetch user insights');
    }
};

// Update an insight
export const updateInsight = async (userId, insightId, updateData) => {
    try {
        // Check if userId and insightId are valid
        if (!userId || !insightId) {
            throw new Error('Invalid userId or insightId');
        }

        const insightRef = doc(db, 'users', userId, 'insights', insightId);

        // Update the insight
        await updateDoc(insightRef, updateData);
        console.log('Insight updated successfully:', insightId);
    } catch (error) {
        console.error('Error updating insight:', error);
        throw new Error('Failed to update insight');
    }
};