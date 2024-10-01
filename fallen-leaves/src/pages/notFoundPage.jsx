import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css/NotFoundPage.module.css';

function NotFoundPage() {
    const navigate = useNavigate();

    // Takes the user back to the home page
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className={styles.container}>
            <div className={styles.notFound}>
                <h1 className={styles.header}>404 - Page Not Found</h1>
                <p className={styles.content}>
                    Oops! The page you're looking for doesn't exist.
                </p>
                <button className="btnSecondaryDesktop" onClick={handleGoHome}>
                    Go Back Home
                </button>
            </div>
        </div>
    );
}

export default NotFoundPage