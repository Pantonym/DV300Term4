import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
// Global CSS
import './globalStyles.css';
// Components
import NavbarComponent from './components/navbar/NavbarComponent';
// Pages
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import UserHabitsPage from './pages/UserHabitsPage';
import DashboardPage from './pages/DashboardPage';
import AllEntriesPage from './pages/AllEntriesPage';
// Contexts
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/privateRouteContext';

const AppWrapper = () => {
  const location = useLocation();
  const shouldShowNavbar = !['/login'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavbarComponent />}

      <div className='appWrapper'>
        <Routes>
          {/* Protected route for login */}
          {/* Dashboard */}
          <Route path="/" element={<PrivateRoute element={<DashboardPage />} />} />

          {/* Habits */}
          <Route path="/habits" element={<PrivateRoute element={<UserHabitsPage />} />} />

          {/* --All Entries */}
          <Route path="/allEntries" element={<PrivateRoute element={<AllEntriesPage />} />} />

          {/* Login */}
          <Route path="login" element={<LoginPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/DV300Term4">
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;