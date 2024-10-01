//   Checks if the current user is authenticated. If they are, render the requested component. If not, render /register
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const PrivateRoute = ({ element }) => {
    const { currentUser } = useAuth();

    // ReRoute to the login page if the user is not logged in
    return currentUser ? element : <Navigate to="/login" />;
};

export default PrivateRoute;