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
// Contexts
import { AuthProvider } from './contexts/authContext';
import PrivateRoute from './contexts/privateRouteContext';

const AppWrapper = () => {
  const location = useLocation();
  const shouldShowNavbar = !['/login'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavbarComponent />}

      <div style={{ marginLeft: '175px', padding: '20px' }}>
        <Routes>
          {/* Protected route for login */}
          {/* <Route path="/" element={<PrivateRoute element={<HomePage />} />} /> */}
          <Route path="/" element={<HomePage />} />
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