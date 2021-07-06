import React, { useEffect } from 'react';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import { useDispatch, useSelector } from 'react-redux';
import ssjs from 'senswapjs';
//
import styles from './styles';
import Avatar from 'senswap-ui/avatar';
import { HelpOutlineRounded } from 'senswap-ui/icons';
import { getStakeAccountData } from 'modules/bucket.reducer';
import CircularProgress from 'senswap-ui/circularProgress';
import Farm from 'helpers/farm';
import { PoolAvatar } from 'containers/pool';
import { withStyles } from 'senswap-ui/styles';

const COLS = ['LP TOKEN', 'STAKE ACCOUNT', 'LIQUIDITY', ' EARNED', 'REWARD TOKEN'];

function RenderLoading() {
  return (
    <TableRow>
      {COLS.map((elm) => {
        return (
          <TableCell key={elm}>
            <CircularProgress size={17} />
          </TableCell>
        );
      })}
    </TableRow>
  );
}

function Liquidity(props){
  const { stakeAccAddr, token } = props;
  const stakeAccountData = useSelector((state) => state.bucket[stakeAccAddr]);
  return <TableCell> {Number(ssjs.undecimalize(stakeAccountData.amount, token.decimals)).toFixed(2)}</TableCell>
}

function DebtAccountItems(props) {
  const { address, classes } = props;
  const debtData = useSelector((state) => state.bucket[address]);
  //Check Loading
  if (!debtData) return <RenderLoading></RenderLoading>;

  const { account, pool, stake_pool } = debtData;
  if (!pool.address) return null;

  const { mint_token: token } = stake_pool;
  const {
    mintS: { icon: iconS, symbol: symbolS },
    mintA: { icon: iconA, symbol: symbolA },
    mintB: { icon: iconB, symbol: symbolB },
  } = debtData.pool;
  const icons = [iconA, iconB, iconS];
  const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
 
  return (
    <TableRow className={classes.tableRow}>
      <TableCell>
        <Grid container className={classes.noWrap} alignItems="center">
          <Grid item>
            <PoolAvatar icons={icons} />
          </Grid>
          <Grid item>
            <Typography>{name || 'UNKNOWN'}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell> {account.address}</TableCell>
      <Liquidity stakeAccAddr = {account.address} token={token}></Liquidity>
      <TableCell>{Number(Farm.calculateReward(stake_pool, debtData)).toFixed(2)}</TableCell>
      <TableCell>
        <Avatar src={iconS} className={classes.icon}>
          <HelpOutlineRounded />
        </Avatar>
      </TableCell>
    </TableRow>
  );
}

function StakeAccounts(props) {
  const { classes } = props;
  const stakeAccounts = useSelector((state) => state.wallet.stakeAccounts);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      for (const address of stakeAccounts) {
        await dispatch(getStakeAccountData(address));
      }
    }
    fetchData();
  }, []);

  return (
    <Grid container>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {COLS.map((title) => (
                  <TableCell key={title}>
                    <Typography variant="caption" color="textSecondary">
                      {title}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            
            <TableBody>
              {stakeAccounts.map((address) => {
                return <DebtAccountItems address={address} classes={classes}></DebtAccountItems>;
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
}
export default withStyles(styles)(StakeAccounts);
