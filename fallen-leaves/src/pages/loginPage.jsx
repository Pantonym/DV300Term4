import React, { useState } from 'react'
import styles from './css/LoginPage.module.css'

function LoginPage() {
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);

    const toggleForm = () => {
        setIsLoginFormVisible(!isLoginFormVisible);
    };

    return (
        <div className={styles.container}>
            {/* Login Form */}
            {isLoginFormVisible && (
                <div className={styles.signUpForm}>
                    <h1 className={styles.fontWhite}>Login</h1>

                    <div className={styles.AlignLeft}>
                        <label>Email</label>
                        <input type='text'></input>

                        <label>Password</label>
                        <input type='text'></input>
                    </div>

                    <button className='btnSecondaryDesktop'>Submit</button>

                    <p className={styles.btnSwitchLabel}>Don't have an account?</p>
                    <button className={styles.btnSwitch} onClick={toggleForm}>Register</button>
                </div>
            )}

            {/* Register Form */}
            {!isLoginFormVisible && (
                <div className={styles.registerForm}>
                    <h1 className={styles.fontWhite}>Register</h1>

                    <div className={styles.AlignLeft}>
                        <label>Username</label>
                        <input type='text'></input>

                        <label>Email</label>
                        <input type='text'></input>

                        <label>Password</label>
                        <input type='text'></input>
                    </div>

                    <button className='btnSecondaryDesktop'>Submit</button>

                    <p className={styles.btnSwitchLabel}>Already have an account?</p>
                    <button className={styles.btnSwitch} onClick={toggleForm}>Sign In</button>
                </div>
            )}
        </div>
    )
}

export default LoginPage