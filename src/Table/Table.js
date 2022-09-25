import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import styles from "./styles.module.css";
import { useTable } from "./hook";

export const CurrencyTable = () => {
  const { loading, error, currency: rows } = useTable();

  if (error) {
    return <div className={styles.info}>{error}</div>;
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ width: "70%" }}
      className={styles.table}
    >
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
            {rows.map(row => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                className={styles.tableRow}
              >
                <TableCell component="th" scope="row">
                  {row.currency}
                </TableCell>
                <TableCell align="right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
