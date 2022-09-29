import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import styles from "./styles.module.css";

export const CurrencyTable = () => {
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}`)
      .then(response => response.json())
      .then(res => {
        setCurrency(res);
      })
      .catch(error => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <TableContainer component={Paper} className={styles.table}>
      {loading ? (
        <div className={styles.info}>Loading...</div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(currency).map(([currencyName, exchangeRate]) => (
              <TableRow key={currencyName} className={styles.tableRow}>
                <TableCell component="th" scope="row">
                  {currencyName}
                </TableCell>
                <TableCell align="right">{exchangeRate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
