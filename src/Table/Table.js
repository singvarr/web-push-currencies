import {useEffect, useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from '@mui/material/Checkbox';
import Paper from "@mui/material/Paper";
import styles from "./styles.module.css";

export const CurrencyTable = () => {

    const data = [
        {
            currency: 'usd',
            value: 40.34,
            isSelected: false
        },
        {
            currency: 'eur',
            value: 40.34,
            isSelected: false
        }]

    const [loading, setLoading] = useState(true);
    const [currencies, setCurrencies] = useState([]);


    useEffect(() => {
        fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
            .then(response => response.json())
            .then(res => {
                //todo replace when data will be ready
                console.log(res);
                setCurrencies(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


    const handleSelectAllClick = () => {
        if (currencies.every(item => item.isSelected)) {
            setCurrencies(currencies.map(item => {
                return {...item, isSelected: false}
            }))
        } else setCurrencies(currencies.map(item => {
            return {...item, isSelected: true}
        }))
    };

    const handleClick = (event, currencyName) => {
        setCurrencies(currencies.map(item => {
            if (currencyName === item.currency) {
                return {...item, isSelected: !item.isSelected}
            } else return item
        }))
    };

    return (
        <TableContainer component={Paper} className={styles.table}>
            {loading ? (
                <div className={styles.info}>Loading...</div>
            ) : (
                <Table>
                    <TableHead>
                        <TableRow>
                            <Checkbox
                                color="primary"
                                checked={currencies.every(item => item.isSelected)}
                                onChange={handleSelectAllClick}
                            />
                            <TableCell>Currency</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currencies.map(({currency, value, isSelected}) => (
                            <TableRow key={currency} className={styles.tableRow}>
                                <Checkbox
                                    color="primary"
                                    checked={isSelected}
                                    onChange={event => handleClick(event, currency)}
                                />
                                <TableCell component="th" scope="row">
                                    {currency}
                                </TableCell>
                                <TableCell align="right">{value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};
