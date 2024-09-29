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
import HomePage from './pages/HomePage';
import HabitsPage from './pages/HabitsPage';
import InsightsPage from './pages/InsightsPage';
import AccountPage from './pages/AccountPage';
// Contexts
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/privateRouteContext';

// TODO: Mobile responsiveness

const AppWrapper = () => {
  const location = useLocation();
  const shouldShowNavbar = !['/login'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavbarComponent />}

      <div className='appWrapper'>
        <Routes>
          {/* Protected route for login */}
          <Route path="/" element={<PrivateRoute element={<HomePage />} />} />

          {/* Home */}
          {/* <Route path="/" element={<HomePage />} /> */}

          {/* Habits */}
          <Route path="/habits" element={<PrivateRoute element={<HabitsPage />} />} />

          {/* Insights */}
          <Route path="/insights" element={<PrivateRoute element={<InsightsPage />} />} />

          {/* Account */}
          <Route path="/account" element={<PrivateRoute element={<AccountPage />} />} />

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
      <Router basename="/DV300TERM4">
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
}

export default App;