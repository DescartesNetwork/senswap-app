import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles, makeStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';

import { UpdateRounded, LanguageRounded } from 'senswap-ui/icons';

import { PoolAvatar } from 'containers/wallet';
import Interaction from './interaction';

import styles from './styles';
import utils from 'helpers/utils';
import { getPools } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


const useStyles = makeStyles(theme => ({
  noWrap: {
    flexWrap: 'nowrap',
  },
  stretch: {
    flex: '1 1 auto',
  },
  tableRow: {
    cursor: 'pointer',
    transition: theme.transitions.create(),
    '&:hover': {
      backgroundColor: theme.palette.background.secondary,
    },
  },
}));

function Row(props) {
  const { data, onClick } = props;
  const {
    address, state, vault,
    mint_s, mint_a, mint_b, mint_lpt,
    treasury_s, treasury_a, treasury_b,
  } = data;
  const { supply, decimals } = mint_lpt || {}
  const { symbol: symbolS, icon: iconS, decimals: decimalsS } = mint_s || {}
  const { symbol: symbolA, icon: iconA, decimals: decimalsA } = mint_a || {}
  const { symbol: symbolB, icon: iconB, decimals: decimalsB } = mint_b || {}
  const { amount: amountS } = treasury_s || {}
  const { amount: amountA } = treasury_a || {}
  const { amount: amountB } = treasury_b || {}
  const { amount: earn } = vault || {}
  const icons = [iconA, iconB, iconS];

  const classes = useStyles();

  const toExplorer = () => {
    return window.open(utils.explorer(address));
  }

  if (!state) return null;
  return <TableRow className={classes.tableRow} onClick={onClick}>
    <TableCell>
      <Grid container className={classes.noWrap} alignItems="center">
        <Grid item>
          <PoolAvatar icons={icons} onClick={toExplorer} />
        </Grid>
        <Grid item>
          <Typography>{`${symbolA || '.'}/${symbolB || '.'}/${symbolS || '.'}`}</Typography>
        </Grid>
      </Grid>
    </TableCell>
    <TableCell align="right">
      <Typography>{utils.prettyNumber(ssjs.undecimalize(amountA, decimalsA)) || 0} <span style={{ color: '#808191' }}>{symbolA}</span></Typography>
      <Typography>{utils.prettyNumber(ssjs.undecimalize(amountB, decimalsB)) || 0} <span style={{ color: '#808191' }}>{symbolB}</span></Typography>
      <Typography>{utils.prettyNumber(ssjs.undecimalize(amountS, decimalsS)) || 0} <span style={{ color: '#808191' }}>{symbolS}</span></Typography>
    </TableCell>
    <TableCell align="right">
      <Typography>{utils.prettyNumber(ssjs.undecimalize(supply, decimals)) || 0}</Typography>
    </TableCell>
    <TableCell align="right">
      <Typography>{utils.prettyNumber(ssjs.undecimalize(earn, decimalsS)) || 0} <span style={{ color: '#808191' }}>{symbolS}</span></Typography>
    </TableCell>
  </TableRow>
}

class Pools extends Component {
  constructor() {
    super();

    this.state = {
      page: -1,
      limit: 5,
      data: [],
      loading: false,
      selected: -1,
    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    return this.fetchData();
  }

  fetchData = (force = false) => {
    const { getPools, getPoolData, setError } = this.props;
    const { page, limit } = this.state
    return this.setState({ loading: true, lasttime: new Date() }, () => {
      return getPools({}, limit, page + 1).then(data => {
        return data.each(({ address }) => getPoolData(address, force), { skipError: true, skipIndex: true });
      }).then(data => {
        return this.setState({ data, loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onRefresh = () => {
    return this.fetchData(true);
  }

  onPool = (i) => {
    return this.setState({ selected: i });
  }

  onClose = () => {
    return this.setState({ selected: -1 });
  }

  render() {
    const { classes } = this.props;
    const { data, loading, lasttime, selected } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton color="primary">
              <LanguageRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6" color="primary">Pools</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <IconButton size="small" onClick={this.onRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={17} /> : <UpdateRounded />}
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Reserve</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">LPT</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Earn</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data.length ? <TableRow>
                <TableCell>
                  <Typography variant="caption">No data</Typography>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow> : null}
              {data.map((poolData, i) => <Row
                key={i}
                data={poolData}
                onClick={() => this.onPool(i)}
              />)}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Typography variant="caption">Last updated on: {utils.prettyDatetime(lasttime)}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Interaction visible={selected >= 0} onClose={this.onClose} poolData={data[selected]} />
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  pool: state.pool,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getPools,
  getPoolData,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Pools)));