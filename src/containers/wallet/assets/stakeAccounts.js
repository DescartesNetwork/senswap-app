import React, { useEffect, useState } from "react";
import Grid from "senswap-ui/grid";
import Typography from "senswap-ui/typography";
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from "senswap-ui/table";
import { useSelector } from "react-redux";
//
import ssjs from "senswapjs";
const farming = new ssjs.Farming();

export default function StakeAccounts() {
  const walletStake = useSelector((state) => state.wallet.stakeAccounts);
  const [stakeAccounts, setStakeAccounts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const promise = [];
      for (const address of walletStake) {
        promise.push(farming.getDebtData(address));
      }
      const stakeData = await Promise.all(promise);
      setStakeAccounts(stakeData);
    }
    fetchData();
  }, [walletStake]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {["Stake Pool Address", "Amount", " Earned"].map((title) => (
                  <TableCell key={title}>
                    <Typography variant="caption" color="textSecondary">
                      {title}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stakeAccounts.map((stake) => {
                const token = stake.stake_pool.mint_token;
                const stakePoolAddr = stake.stake_pool.address;
                return (
                  <TableRow key={stakePoolAddr}>
                    <TableCell> {stakePoolAddr}</TableCell>
                    <TableCell> {ssjs.undecimalize(stake.account.amount, token.decimals)}</TableCell>
                    <TableCell> {ssjs.undecimalize(stake.debt, token.decimals)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
