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
import {broadcastChannelTypes, pushNotificationPermitStatuses} from "../../consts";
import { ReactComponent as Error } from '../../icons/error_icon.svg'

const broadcastChannel = new BroadcastChannel("BroadcastChannel");


const getSubscriptionUrl = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        return await navigator.serviceWorker.ready.then(registration => {
            return registration.pushManager.getSubscription();
        });
    }
}


const CurrencyTable = () => {
    const [loading, setLoading] = useState(true);
    const [currencies, setCurrencies] = useState([]);
    const [updatedCurrencies, setUpdatedCurrencies] = useState([]);
    const [subscribedCurrencies, setSubscribedCurrencies] = useState();
    const [notificationPermission, setNotificationPermission] = useState('') // granted | denied

    useEffect(() => {
        if (updatedCurrencies.length > 0) {
            setTimeout(() => {
                setUpdatedCurrencies([])
            }, 2000)
        }
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
            await getSubscribedCurrenciesAPIRequest(existingSubs.endpoint)
        }

        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === pushNotificationPermitStatuses.granted) {
            getSubscribedCurrencies()
        }

        broadcastChannel.onmessage = (event) => {
            const {type, payload} = event.data;

            if (type === broadcastChannelTypes.getPushMessage) {

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

        setLoading(false);

    }, []);


    const updateSubscriptionAPIRequest = async (currencies) => {

        const subscription = await getSubscriptionUrl()

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
        updateSubscriptionAPIRequest(selected)
    }

    const handleFirstGrant = (currencyName) => {
        handleCheckbox(currencyName)

        broadcastChannel.postMessage({type: broadcastChannelTypes.permissionGranted})

        broadcastChannel.onmessage = event => {
            const {type} = event.data;

            if (type === broadcastChannelTypes.initialSubscription) {
                updateSubscriptionAPIRequest([currencyName])
            }
        }
    }


    const handleSubscribeToCurrencyUpdate = (currencyName) => {

        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === pushNotificationPermitStatuses.granted) {
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            handleCheckbox(currencyName)
        } else if (Notification.permission !== pushNotificationPermitStatuses.denied) {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                if (permission === pushNotificationPermitStatuses.granted) {
                    handleFirstGrant(currencyName)
                }
                if (permission === pushNotificationPermitStatuses.denied) {
                    setNotificationPermission(pushNotificationPermitStatuses.denied)
                }
            });
        }
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

            {notificationPermission === pushNotificationPermitStatuses.denied && <div>
                <span className={styles.error}>You have denied permission for push notifications</span>
                <Error/>
            </div>}
        </>
    );
};

export default CurrencyTable;
