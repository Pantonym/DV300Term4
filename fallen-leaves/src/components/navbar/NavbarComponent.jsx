import React, { useState } from 'react'
import { Link } from 'react-router-dom'
// CSS
import styles from './NavbarComponent.module.css';
// Images
import Logo from '../../assets/AppIcon.png'

function NavbarComponent() {
    const [activeIndex, setActiveIndex] = useState(0);

    const handleNavClick = (index) => {
        setActiveIndex(index);
    };

    return (
        <div className={`${styles.leftNav} lora_font`}>
            <nav>
                <Link to="/" className={styles.navLink}>
                    <div onClick={() => handleNavClick(0)} className={styles.navLogo}>
                        <img src={Logo} className={styles.logoImg} alt='LogoImage' />
                    </div>
                </Link>

                <Link to="/" className={styles.navLink}>
                    <div onClick={() => handleNavClick(0)}>
                        <ion-icon name="leaf-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        {activeIndex === 0 && <h2>Dashboard</h2>}
                    </div>
                </Link>

                <Link to="/habits" className={styles.navLink}>
                    <div onClick={() => handleNavClick(1)}>
                        <ion-icon name="clipboard-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        {activeIndex === 1 && <h2>Habits</h2>}
                    </div>
                </Link>

                <Link to="/insights" className={styles.navLink}>
                    <div onClick={() => handleNavClick(2)}>
                        <ion-icon name="analytics-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        {activeIndex === 2 && <h2>Insights</h2>}
                    </div>
                </Link>

                <Link to="/account" className={styles.navLink}>
                    <div onClick={() => handleNavClick(3)}>
                        <ion-icon name="person-outline" style={{ fontSize: '75px', color: 'white' }}></ion-icon>
                        {activeIndex === 3 && <h2>Account</h2>}
                    </div>
                </Link>
            </nav>
        </div>
    )
}

export default NavbarComponent