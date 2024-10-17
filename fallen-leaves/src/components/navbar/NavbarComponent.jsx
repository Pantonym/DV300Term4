import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
// CSS
import styles from './NavbarComponent.module.css';
// Images
import Logo from '../../assets/AppIcon.png'

function NavbarComponent() {
    const [menuOpen, setMenuOpen] = useState(false); //for mobile burger menu
    // Get the current URL location
    const location = useLocation();

    // Determine which index should be active based on the current path
    const getActiveIndexFromPath = (path) => {
        switch (path) {
            case '/':
                return 0;
            case '/habits':
                return 1;
            case '/insights':
                return 2;
            case '/account':
                return 3;
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

                    <Link to="/account" className={styles.navLink}>
                        <div>
                            <ion-icon name="person-outline" style={{ fontSize: '50px', color: 'white' }}></ion-icon>
                            {activeIndex === 3 && <h2>Account</h2>}
                        </div>
                    </Link>
                </nav>
            </div>
        </div>
    )
}

export default NavbarComponent