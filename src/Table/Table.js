import {useEffect, useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
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
