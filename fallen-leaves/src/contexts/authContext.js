import React, { useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createUserProfile, updateUserLastLogin } from '../services/userService';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sets up a listener that monitors whether the user is logged in or not
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Set the current user and stop loading.
            setCurrentUser(user);
            setLoading(false);
        });

        // Stops the listener when the component unmounts. AuthContext wraps the entire app, so it never actually unmounts.
        return unsubscribe;
    }, []);

    // Enable persistence
    useEffect(() => {
        const setAuthPersistence = async () => {
            try {
                // Attempt to set persistence with local persistence supplied by firebase
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Failed to set persistence:', error);
            }
        };

        setAuthPersistence();
    }, []);

    // Log In a user
    async function login(email, password) {
        try {
            // Enable Persistence
            await setPersistence(auth, browserLocalPersistence);

            // Sign In
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Update the user's last log in date
            await updateUserLastLogin(userCredential.user.uid);

            return userCredential.user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Log out a user
    async function logout() {
        try {
            // Await signing out with userService
            await signOut(auth);
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    // Registers a user
    async function register(email, password, username) {
        try {
            // Create a userCredential to generate a uID
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create a new user profile using the information supplied
            await createUserProfile({
                uid: user.uid,
                email: user.email,
                username: username
            });

            // Log the user In to enable persistence and routing
            await login(email, password);

            return user;
        } catch (error) {
            console.error('AuthProvider - Registration Error:', error);
            throw error;
        }
    }

    // Function to change the user's email with the userService
    function changeEmail(newEmail) {
        return updateEmail(auth.currentUser, newEmail);
    }

    // Function to change the user's password with the userService
    function changePassword(newPassword) {
        return updatePassword(auth.currentUser, newPassword);
    }

    // Supplies the functions and information needed to the rest of the app (that is wrapped by authContext)
    const value = {
        currentUser,
        login,
        logout,
        register,
        changeEmail,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}