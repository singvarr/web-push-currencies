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
import {
    checkNotificationPermission,
} from "./utils";

const broadcast = new BroadcastChannel('sw-channel')
const broadcastChannel = new BroadcastChannel("BroadcastChannel");


const getSubscriptionUrl = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        return await navigator.serviceWorker.ready.then(registration => {
            return registration.pushManager.getSubscription().then(sub => sub);
        });
    }
}


const CurrencyTable = () => {
    const [loading, setLoading] = useState(true);
    const [currencies, setCurrencies] = useState([]);
    const [updatedCurrencies, setUpdatedCurrencies] = useState([]);
    const [subscribedCurrencies, setSubscribedCurrencies] = useState();
    const [subscription, setSubscription] = useState()
    const [permission, setPermission] = useState('') // granted | denied

    useEffect(() => {
        updatedCurrencies.length > 0 && setTimeout(() => {
            setUpdatedCurrencies([])
        }, 2000)
    }, [updatedCurrencies])


    const getSubscribedCurrencies = async () => {
        const subscriptionUrl = getSubscriptionUrl().endpoint
        console.log(subscriptionUrl);
        const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/subscription?subscriptionUrl=${subscriptionUrl}`);
        const subscriptionConfig = await response.json();

        if (subscriptionConfig) {
            const {currencies: subscribedCurrencies} = subscriptionConfig;
            setSubscribedCurrencies(subscribedCurrencies)
        }
    }

    const getCurrenciesData = () => {
        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
            .then((response) => response.json())
            .then((data) => {
                const currenciesList = Object.entries(data).map(([name, value]) => ({
                    currency: name,
                    value,
                    isSelected: subscribedCurrencies?.includes(name),
                }))
                setCurrencies(currenciesList)

            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {

        checkNotificationPermission(getSubscribedCurrencies)

        getCurrenciesData()

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


    const updateSubscriptionAPIRequest = (initSubscription) => {
        const selected = currencies.filter(item => item.isSelected).map(cur => cur.currency)

        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/subscription`, {
            method: "post",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({subscription: initSubscription || subscription, selected})
        }).catch(error => {
            console.log("Error", error);
        })
    }

    const handleCheckbox = (currencyName) => {
        setCurrencies(
            currencies.map((item) => (
                currencyName === item.currency ? {...item, isSelected: !item.isSelected} : item
            )),
        );

        updateSubscriptionAPIRequest()
    }

    const handleFirstGrante = (currencyName) => {
        handleCheckbox(currencyName)

        broadcastChannel.postMessage({type: 'permission-granted'})

        let initSubscription
        broadcastChannel.onmessage = event => {
            const {type, payload} = event.data;

            initSubscription = JSON.parse(payload.subscription)
            if (type === 'initial-subscription') {
                console.log(payload.subscription);
                setSubscription(initSubscription)
            }
        }

        updateSubscriptionAPIRequest(initSubscription)
    }


    const handleSubscribeToCurrencyUpdate = (currencyName) => {
        checkNotificationPermission(
            () => handleCheckbox(currencyName),
            () => handleFirstGrante(currencyName),
            () => setPermission('denied'),
            true
        )
    };

    return (
        <>
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
                                            onChange={() => {
                                                debugger
                                                console.log("click")
                                                handleSubscribeToCurrencyUpdate(currency)
                                            }}
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

            {permission === 'denied' && <div>You have denied permission for push notifications</div>}
        </>
    );
};

export default CurrencyTable;
