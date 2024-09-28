import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const usersCollection = 'Users';

export const createUserProfile = async (user) => {
    const { uid, email, username } = user;

    // Create a new document in the Users collection
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

export const updateUserLastLogin = async (uid) => {
    const userDoc = doc(db, usersCollection, uid);
    await updateDoc(userDoc, {
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