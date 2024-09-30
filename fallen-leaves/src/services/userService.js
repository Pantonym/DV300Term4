import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const usersCollection = 'Users';

// Creates a user with the details provided
export const createUserProfile = async (user) => {
    const { uid, email, username } = user;

    // Find the correct user that was just created
    const userDoc = doc(db, usersCollection, uid);

    const userData = {
        email: email,
        username: username,
        avatar: 'defaultURL',
        dateOfRegistration: serverTimestamp(),
        lastLoginDate: serverTimestamp(),
        role: 'user',
        status: 'active'
    };

    // Add user data to Firestore
    await setDoc(userDoc, userData);
}

// Change last login date
export const updateUserLastLogin = async (uid) => {
    // Find the User
    const userDoc = doc(db, usersCollection, uid);
    await updateDoc(userDoc, {
        // Change the time stamp to the new login date
        lastLoginDate: serverTimestamp()
    });
}

export const getUserProfile = async (uid) => {
    const userDoc = doc(db, usersCollection, uid);
    const userSnapshot = await getDoc(userDoc);
    return userSnapshot.exists() ? userSnapshot.data() : null;
};

export const updateUserProfile = async (uid, data) => {
    const userDoc = doc(db, usersCollection, uid);
    await setDoc(userDoc, data, { merge: true });
};