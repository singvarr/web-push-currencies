import {useEffect, useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import styles from './styles.module.css';
import {requestNotificationPermission} from "../../requestNotificationPermission";

const broadcast = new BroadcastChannel('sw-channel')
const bcSubcsr = new BroadcastChannel("bcSubcsr");
const initialSubscriptionsBc = new BroadcastChannel("initialSubscriptionsBc");

const CurrencyTable = () => {
    const [loading, setLoading] = useState(true);
    const [currencies, setCurrencies] = useState([]);
    const [updatedCurrencies, setUpdatedCurrencies] = useState([]);

    useEffect(() => {
        updatedCurrencies.length > 0 && setTimeout(() => {
            setUpdatedCurrencies([])
        }, 2000)
    }, [updatedCurrencies])


    useEffect(() => {
        let subscribed

        initialSubscriptionsBc.onmessage = (event) => {
            subscribed = event.data
        }

        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
            .then((response) => response.json())
            .then((data) => {
                const currenciesList = Object.entries(data).map(([name, value]) => ({
                    currency: name,
                    value,
                    isSelected: subscribed?.includes(name),
                }))
                setCurrencies(currenciesList)

            })
            .finally(() => {
                setLoading(false);
            });

        broadcast.onmessage = (event) => {
            const [currency, value] = event.data.split(':')
            setUpdatedCurrencies([currency])

            setCurrencies(prev => prev.map(item => {
                if (item.currency === currency) {
                    return {
                        ...item, value: value.trim()
                    }
                }
                return item
            }))
        }
    }, []);

    const handleSubscribeToCurrencyUpdate = async (currencyName) => {
        await requestNotificationPermission()

        setCurrencies(
            currencies.map((item) => (
                currencyName === item.currency ? {...item, isSelected: !item.isSelected} : item
            )),
        );
    };


    useEffect(() => {
        const selected = currencies.filter(item => item.isSelected).map(cur => cur.currency)
        bcSubcsr.postMessage(selected);
    }, [currencies])

    return (
        <TableContainer component={Paper} className={styles.table}>
            {loading ? (
                <div className={styles.info}>Loading...</div>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2}>Currency</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currencies.map(({currency, value, isSelected}) => {
                            return <TableRow key={currency}
                                             className={`${styles.tableRow} ${updatedCurrencies.includes(currency) ? styles.highlightRow : ''}`}>
                                <TableCell>
                                    <Checkbox
                                        color="primary"
                                        checked={isSelected}
                                        onChange={() => handleSubscribeToCurrencyUpdate(currency)}
                                    />
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {currency}
                                </TableCell>
                                <TableCell align="right">{value}</TableCell>
                            </TableRow>

                        })}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};

export default CurrencyTable;
