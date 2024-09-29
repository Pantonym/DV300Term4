import React, { useEffect, useState } from 'react'
import styles from './css/InsightsPage.module.css'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'

function InsightsPage() {
    const [pieData1, setPieData1] = useState(null);
    const [pieData2, setPieData2] = useState(null);
    const [barData1, setBarData1] = useState(null);

    useEffect(() => {
        // Simulate an API call to fetch data
        const fetchData1 = async () => {
            const dataFromAPI = {
                labels: ['Data 1', 'Data 2'],
                datasets: [
                    {
                        label: 'Habit Completion',
                        data: [60, 30],
                        backgroundColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)'
                        ],
                        borderColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)'
                        ],
                        borderWidth: 1,
                    },
                ],
            };
            setPieData1(dataFromAPI);
        };

        const fetchData2 = async () => {
            const dataFromAPI = {
                labels: ['Data 1', 'Data 2', 'Data 3', 'Data 4'],
                datasets: [
                    {
                        label: 'Habit Completion',
                        data: [60, 30, 40, 25],
                        backgroundColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)',
                            'rgba(167, 160, 271, 1)',
                            'rgba(254, 162, 235, 1)',
                        ],
                        borderColor: [
                            'rgba(209, 90, 78, 1)',
                            'rgba(242, 160, 123, 1)',
                            'rgba(167, 160, 271, 1)',
                            'rgba(254, 162, 235, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
            setPieData2(dataFromAPI);
        };

        const fetchData3 = async () => {
            const dataFromAPI = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                datasets: [
                    {
                        label: 'Habit 1',
                        data: [12, 19, 10, 5, 12, 6],
                        backgroundColor: 'rgba(209, 90, 78, 1)',
                        borderColor: 'rgba(209, 90, 78, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Habit 2',
                        data: [10, 11, 14, 2, 18, 7],
                        backgroundColor: 'rgba(242, 160, 123, 1)',
                        borderColor: 'rgba(242, 160, 123, 1)',
                        borderWidth: 1,
                    },
                ],
            };
            setBarData1(dataFromAPI);
        };

        fetchData1();
        fetchData2();
        fetchData3();
    }, []);

    return (
        <div className={styles.container}>
            <select id="habitDropdown" className='inter_font'>
                <option value="option1">Habit 1</option>
                <option value="option2">Habit 2</option>
                <option value="option3">Habit 3</option>
            </select>

            <div className={styles.pies}>
                <div className={styles.pieChart}>
                    {pieData1 ? <PieChart chartData={pieData1} /> : <p>Loading chart data...</p>}
                </div>
                <span style={{ width: '50px', height: '50px' }}></span>
                <div className={styles.pieChart}>
                    {pieData2 ? <PieChart chartData={pieData2} /> : <p>Loading chart data...</p>}
                </div>
            </div>

            <div className='hideOnMobile'>
                {barData1 ? <BarChart chartData={barData1} /> : <p>Loading chart data...</p>}
            </div>

            <p className={styles.feedbackHolder}>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quibusdam ratione distinctio
                perspiciatis mollitia explicabo, quia in necessitatibus minus blanditiis natus dolor, cum voluptates!
                Perspiciatis ipsam accusamus quia obcaecati doloremque similique.
            </p>
        </div>
    )
}

export default InsightsPage