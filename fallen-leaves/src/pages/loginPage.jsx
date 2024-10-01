import React, { useState } from 'react'
import styles from './css/LoginPage.module.css'
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';

function LoginPage() {
    // Enable navigation
    const navigate = useNavigate();
    // Error Displaying
    const [error, setError] = useState('');
    // Loading handling
    const [loading, setLoading] = useState(false);
    // Login/Register Form show/hide
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
    // User Data
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register, login } = useAuth();

    // --Login/Register Form show/hide
    const toggleForm = () => {
        setIsLoginFormVisible(!isLoginFormVisible);
    };

    // Registration function
    const handleRegister = async (e) => {
        // Stops the page from being reloaded on form submit
        e.preventDefault();
        // Reset any previous errors
        setError('');

        // Enable loading
        setLoading(true);

        try {
            // Create a user with an email and password using the authContext
            await register(email, password, username);
            console.log('Registration Successful'); // Debug log

            // Navigate to the home screen after successful registration
            navigate('/');
        } catch (err) {
            console.error('Error registering user:', err);
            setError(err.message);
        }

        // Disable loading
        setLoading(false);
    };

    // Login function
    const handleSignup = async (e) => {
        // Stops the page from being reloaded on form submit
        e.preventDefault();
        // Reset any previous errors
        setError('');

        // Enable loading
        setLoading(true);

        try {
            // Attempt to log in through authContext
            await login(email, password);
            console.log('LoginPage - Login Successful');

            // Navigate to the home screen after successful login
            navigate('/');
        } catch (error) {
            console.error('LoginPage - Login Failed:', error);
            setError('Failed to log in');
        }

        setLoading(false);
    }

    // Loader
    if (loading) {
        return (
            <div className="loadingContainer">
                <Oval color="#D75B30" height={80} width={80} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Login Form */}
            {isLoginFormVisible && (
                <div className={styles.signUpForm}>
                    <h1 className={styles.fontWhite}>Login</h1>

                    {/* Error display */}
                    {error && <p className={styles.error}>! {error} !</p>}

                    <div className={styles.AlignLeft}>
                        <label>Email</label>
                        <input type='text' value={email} onChange={(e) => setEmail(e.target.value)} />

                        <label>Password</label>
                        <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button className='btnSecondaryDesktop' onClick={handleSignup} disabled={loading}>Submit</button>

                    <p className={styles.btnSwitchLabel}>Don't have an account?</p>
                    <button className={styles.btnSwitch} onClick={toggleForm} disabled={loading}>Register</button>
                </div>
            )}

            {/* Register Form */}
            {!isLoginFormVisible && (
                <div className={styles.registerForm}>
                    <h1 className={styles.fontWhite}>Register</h1>

                    {/* Error display */}
                    {error && <p className={styles.error}>! {error} !</p>}

                    <div className={styles.AlignLeft}>
                        <label>Username</label>
                        <input type='text' value={username} onChange={(e) => setUsername(e.target.value)} />

                        <label>Email</label>
                        <input type='text' value={email} onChange={(e) => setEmail(e.target.value)} />

                        <label>Password</label>
                        <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button className='btnSecondaryDesktop' onClick={handleRegister} disabled={loading}>Submit</button>

                    <p className={styles.btnSwitchLabel}>Already have an account?</p>
                    <button className={styles.btnSwitch} onClick={toggleForm} disabled={loading}>Sign In</button>
                </div>
            )}
        </div>
    )
}

export default LoginPage