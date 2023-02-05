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

    const getSubscribedCurrenciesAPIRequest = async (subscriptionUrl) => {
        const subscriptionConfig = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/subscription?subscriptionUrl=${subscriptionUrl}`).then(res => res.json());

        if (subscriptionConfig) {
            const {currencies: subscribedCurrencies} = subscriptionConfig;
            setSubscribedCurrencies(subscribedCurrencies)
        }
    }

    useEffect(() => {
        const cur = currencies.map(cur => {
            if (subscribedCurrencies?.includes(cur.currency)) {
                return {
                    ...cur,
                    isSelected: true
                }
            }
            return cur
        })
        setCurrencies(cur)

        setLoading(false);
    }, [subscribedCurrencies])

    const getCurrenciesData = () => {
        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
            .then((response) => response.json())
            .then((data) => {
                const currenciesList = Object.entries(data).map(([name, value]) => ({
                    currency: name,
                    value,
                    isSelected: false,
                }))
                setCurrencies(currenciesList)

            })
    }

    useEffect(() => {

        getCurrenciesData()

        const getSubscribedCurrencies = async () => {

            const existingSubs = await getSubscriptionUrl()
            setSubscription(existingSubs)
            getSubscribedCurrenciesAPIRequest(existingSubs.endpoint)
        }

        checkNotificationPermission(getSubscribedCurrencies)

        broadcastChannel.onmessage = (event) => {
            const {type, payload} = event.data;

            if (type === 'get-push-message') {

                const [currency, value] = payload.split(':')
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
        }
    }, []);


    const updateSubscriptionAPIRequest = (subscription, currencies) => {
        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/subscription`, {
            method: "post",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({subscription, currencies})
        }).catch(error => {
            console.log("Error", error);
        })
    }

    const handleCheckbox = (currencyName) => {
        const updatedCurrencies = currencies.map((item) => (
            currencyName === item.currency ? {...item, isSelected: !item.isSelected} : item
        ))

        setCurrencies(updatedCurrencies);

        const selected = updatedCurrencies.filter(item => item.isSelected).map(cur => cur.currency)
        updateSubscriptionAPIRequest(subscription, selected)
    }

    const handleFirstGrante = (currencyName) => {
        handleCheckbox(currencyName)

        broadcastChannel.postMessage({type: 'permission-granted'})

        let initSubscription
        broadcastChannel.onmessage = event => {
            const {type, payload} = event.data;

            if (type === 'initial-subscription') {
                initSubscription = JSON.parse(payload.subscription)
                setSubscription(initSubscription)
                updateSubscriptionAPIRequest(initSubscription, [currencyName])
            }
        }

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
