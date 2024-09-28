//   Checks if the current user is authenticated. If they are, render the requested component. If not, render /register
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

const PrivateRoute = ({ element }) => {
    const { currentUser } = useAuth();

    return currentUser ? element : <Navigate to="/login" />;
};

export default PrivateRoute;