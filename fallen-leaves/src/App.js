import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
// Global CSS
import './globalStyles.css';
// Components
import NavbarComponent from './components/navbar/NavbarComponent';
// Pages
import NotFoundPage from './pages/notFoundPage';
import LoginPage from './pages/loginPage';
import HomePage from './pages/homePage';
import HabitsPage from './pages/habitsPage';
import InsightsPage from './pages/insightsPage';
// Contexts
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/privateRouteContext';

const AppWrapper = () => {
  const location = useLocation();
  const shouldShowNavbar = !['/login'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavbarComponent />}

      <div style={{ marginLeft: '175px', padding: '30px', paddingLeft: '50px' }}>
        <Routes>
          {/* Protected route for login */}
          {/* <Route path="/" element={<PrivateRoute element={<HomePage />} />} /> */}

          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Habits */}
          <Route path="/habits" element={<HabitsPage />} />

          {/* Insights */}
          <Route path="/insights" element={<InsightsPage />} />

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