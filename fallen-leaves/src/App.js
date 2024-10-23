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
import HabitsPage from './pages/HabitsPage';
import InsightsPage from './pages/InsightsPage';
import DashboardPage from './pages/DashboardPage';
// Contexts
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/privateRouteContext';
import AllEntriesPage from './pages/AllEntriesPage';

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
          <Route path="/habits" element={<PrivateRoute element={<HabitsPage />} />} />

          {/* --All Entries */}
          <Route path="/allEntries" element={<PrivateRoute element={<AllEntriesPage />} />} />

          {/* Insights */}
          <Route path="/insights" element={<PrivateRoute element={<InsightsPage />} />} />

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