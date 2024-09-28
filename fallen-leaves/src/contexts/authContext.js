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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const setAuthPersistence = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Failed to set persistence:', error);
            }
        };
        setAuthPersistence();
    }, []);

    async function login(email, password) {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await updateUserLastLogin(userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    async function register(email, password, username) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await createUserProfile({
                uid: user.uid,
                email: user.email,
                username: username
            });
            await login(email, password);
            return user;
        } catch (error) {
            console.error('AuthProvider - Registration Error:', error);
            throw error;
        }
    }

    function changeEmail(newEmail) {
        return updateEmail(auth.currentUser, newEmail);
    }

    function changePassword(newPassword) {
        return updatePassword(auth.currentUser, newPassword);
    }

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