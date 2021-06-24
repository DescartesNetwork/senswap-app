import React, { useEffect, useState } from "react";
//Theme Material
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { Button, Grid } from "@material-ui/core";
//Theme Senswap
import Drain from "senswap-ui/drain";
import Header from "./header";
import Detail from "./detail";
//
import FarmingService from "./services";

export default function Farming() {
  const [stakePools, setStakePools] = useState([]);
  const [detail, setDetail] = useState({
    isOpen: false,
    amountHavest: 0,
    amountStake: 0,
    amountUnstake: 0,
    data: {},
  });

  useEffect(() => {
    async function fetchData() {
      //Fetch list stake pool
      const stakePools = await FarmingService.fetchStakePools();
      setStakePools(stakePools);
    }
    fetchData();
  }, []);

  function handleOpenDetail(data) {
    const detail = {
      isOpen: true,
      data,
    };
    setDetail(detail);
  }

  function handleCloseDetail() {
    const detail = {
      isOpen: false,
      data: {},
    };
    setDetail(detail);
  }

  function handleStake(stakePool) {
    console.log("handleStake", stakePool);
    FarmingService.stake(detail.amountStake, stakePool);
  }

  function handleUnstake(stakePool) {
    console.log("handleUnstake", stakePool);
    FarmingService.unstake(detail.amountStake, stakePool);
  }

  function handleHavest(amount, stakePool) {}

  function handleChangeDetailAmount(e) {
    detail[e.target.name] = e.target.value;
    setDetail(detail);
  }

  return (
    <Grid container>
      <Detail {...detail} onClose={handleCloseDetail} onChange={handleChangeDetailAmount} onStake={handleStake} onUnstake={handleUnstake} onHavest={handleHavest}></Detail>
      <Grid item xs={12}>
        <Header />
        
      </Grid>
      <Grid item xs={12}>
        <Drain />
        <Button onClick={() => FarmingService.createStakePool()}>New Stake Pool</Button>
      </Grid>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Pool address</TableCell>
              <TableCell align="right">Earned</TableCell>
              <TableCell align="right">APR</TableCell>
              <TableCell align="right">Liquidity</TableCell>
              <TableCell align="right">Detail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stakePools.map((pool) => (
              <React.Fragment>
                <TableRow key={pool.address}>
                  <TableCell component="th" scope="row">
                    {pool.address}
                  </TableCell>
                  <TableCell align="right">0</TableCell>
                  <TableCell align="right">0</TableCell>
                  <TableCell align="right">0</TableCell>
                  <TableCell align="right">
                    <Button onClick={() => handleOpenDetail(pool)}>Detail</Button>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
