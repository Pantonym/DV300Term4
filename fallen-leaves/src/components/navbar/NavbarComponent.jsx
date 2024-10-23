import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
// CSS
import styles from './NavbarComponent.module.css';
// Images
import Logo from '../../assets/AppIcon.png'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

function NavbarComponent() {
    const [menuOpen, setMenuOpen] = useState(false); //for mobile burger menu
    // Get the current URL location
    const location = useLocation();
    // Enable navigation
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Determine which index should be active based on the current path
    const getActiveIndexFromPath = (path) => {
        switch (path) {
            case '/':
                return 0;
            case '/habits':
                return 1;
            case '/allEntries':
                return 1;
            case '/insights':
                return 2;
            default:
                return 0; // Defaults to Dashboard if no path matches
        }
    };

    // Set the active index based on the current URL
    const [activeIndex, setActiveIndex] = useState(getActiveIndexFromPath(location.pathname));

    // Update the active index whenever the location changes (so when the user navigates)
    useEffect(() => {
        setActiveIndex(getActiveIndexFromPath(location.pathname));
    }, [location]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Confirm is the user wants to log out, and if they do log out and navigate to the login page
    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to log out?');

        if (confirmed) {
            try {
                await logout();
                console.log('Successfully logged out');
                navigate('/login');
            } catch (error) {
                console.error('Logout Error:', error);
            }
        } else {
            console.log('Logout canceled');
        }
    };

    return (
        <div>
            {/* Mobile Burger Menu */}
            <div className={styles.burgerMenu} onClick={toggleMenu}>
                <ion-icon name="menu-outline" style={{ fontSize: '60px', color: menuOpen ? '#F6DFB1' : '#D75B30' }}></ion-icon>
            </div>

            {/* Navbar */}
            <div className={`${styles.leftNav} ${menuOpen ? styles.open : ''} lora_font`}>
                <nav>
                    <Link to="/" className={styles.navLink}>
                        <div className={styles.navLogo}>
                            <img src={Logo} className={styles.logoImg} alt='LogoImage' />
                        </div>
                    </Link>

                    {/* TODO: Change icons to #7d0541 when active */}
                    <Link to="/" className={styles.navLink}>
                        <div>
                            <ion-icon name="leaf-outline" style={{ fontSize: '50px', color: 'white' }}></ion-icon>
                            {activeIndex === 0 && <h2>Dashboard</h2>}
                        </div>
                    </Link>

                    <Link to="/habits" className={styles.navLink}>
                        <div>
                            <ion-icon name="clipboard-outline" style={{ fontSize: '50px', color: 'white' }}></ion-icon>
                            {activeIndex === 1 && <h2>Habits</h2>}
                        </div>
                    </Link>

                    <Link to="/insights" className={styles.navLink}>
                        <div>
                            <ion-icon name="analytics-outline" style={{ fontSize: '50px', color: 'white' }}></ion-icon>
                            {activeIndex === 2 && <h2>Insights</h2>}
                        </div>
                    </Link>
                </nav>

                {/* TODO: Style button */}
                <button style={{ alignSelf: 'center' }} className={styles.logoutButton} onClick={handleLogout}>Log Out</button>
            </div>
        </div>
    )
}

export default NavbarComponent