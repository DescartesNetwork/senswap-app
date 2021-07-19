import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';
import CircularProgress from 'senswap-ui/circularProgress';
import Tooltip from 'senswap-ui/tooltip';

import { CloseRounded, SearchRounded, LaunchRounded } from 'senswap-ui/icons';

import { PoolAvatar } from 'containers/pool';

import styles from '../styles';
import { getPools } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


function ListLPT({ classes, visible, onClose, onSelect }) {
  const [state, setState] = useState({
    isLoading: true,
    searchValue: '',
    pools: [],
  });
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchStakePools() {
      const pools = await dispatch(getPools());
      const poolData = await Promise.all(pools.map((pool) => dispatch(getPoolData(pool.address))));
      return setState({
        isLoading: true,
        searchValue: '',
        pools: poolData,
      });
    }
    fetchStakePools();
  }, [dispatch]);

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    return setState({ ...state, searchValue });
  }

  return (
    <Dialog open={visible} onClose={onClose} fullWidth>
      {/* Title */}
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">
              <strong>Search</strong>
            </Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      {/* Content */}
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              placeholder="Search token"
              value={state.searchValue}
              onChange={(e) => handleSearch(e)}
              InputProps={{
                startAdornment: (<IconButton size="small">
                  <SearchRounded />
                </IconButton>),
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  {!state.pools.length ? <TableRow>
                    <TableCell />
                    <TableCell>
                      {state.isLoading ? <CircularProgress size={17} /> : <Typography variant="caption">No token</Typography>}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow> : null}
                  {state.pools.map((pool) => {
                    const {
                      address: poolAddress,
                      mint_s: { icon: iconS, symbol: symbolS },
                      mint_a: { icon: iconA, symbol: symbolA },
                      mint_b: { icon: iconB, symbol: symbolB },
                    } = pool;
                    const icons = [iconA, iconB, iconS];
                    const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
                    return <TableRow key={poolAddress} className={classes.tableRow} onClick={() => onSelect(pool)}>
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
                      <TableCell>
                        <Tooltip title="Go to the pool">
                          <IconButton color="primary" component={RouterLink} to={`/board/${poolAddress}`}>
                            <LaunchRounded />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

export default withStyles(styles)(ListLPT);
