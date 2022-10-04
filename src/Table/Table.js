import React, {useEffect, useMemo, useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from '@mui/material/Checkbox';
import Paper from "@mui/material/Paper";
import styles from "./styles.module.css";
import axiosInstance from "../axios";

export const CurrencyTable = () => {
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState([]);

    useEffect(() => {
        axiosInstance.get('/')
            .then((res) => setCurrency(res.data))
            .catch(error => console.error("Error:", error))
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const rows = useMemo(() => Object.entries(currency), [currency])

    const [selected, setSelected] = React.useState([]);

    const isSelected = (name) => selected.indexOf(name) !== -1;

    const numSelected = selected.length
    const rowCount = rows.length

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map(([currencyName]) => currencyName);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    console.log(selected);

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
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
                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                checked={rowCount > 0 && numSelected === rowCount}
                                onChange={handleSelectAllClick}
                            />
                            <TableCell>Currency</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map(([currencyName, exchangeRate]) => {
                            const isItemSelected = isSelected(currencyName);
                            return <TableRow key={currencyName} className={styles.tableRow}>
                                <Checkbox
                                    color="primary"
                                    checked={isItemSelected}
                                    onChange={event => handleClick(event, currencyName)}
                                />
                                <TableCell component="th" scope="row">
                                    {currencyName}
                                </TableCell>
                                <TableCell align="right">{exchangeRate}</TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};
