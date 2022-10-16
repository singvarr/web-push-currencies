import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import styles from './styles.module.css';

const CurrencyTable = () => {
  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
      .then((response) => response.json())
      .then((data) => {
        const currenciesList = Object.entries(data).map(([name, value]) => ({
          currency: name,
          value,
          // TODO: retrieve it from the server-side
          isSelected: false,
        }))
        setCurrencies(currenciesList)
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubscribeToCurrencyUpdate = (currencyName) => {
    setCurrencies(
      currencies.map((item) => (
        currencyName === item.currency ? { ...item, isSelected: !item.isSelected } : item
      )),
    );
  };


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
            {currencies.map(({ currency, value, isSelected }) => (
              <TableRow key={currency} className={styles.tableRow}>
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
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default CurrencyTable;