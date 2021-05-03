import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';

import { UpdateRounded } from '@material-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';


function Row(props) {
  const { data: { state, address, reserve, lpt, mint }, onChange } = props;
  const [checked, onChecked] = useState(state === 1);
  const onActive = e => {
    onChecked(e.target.checked);
    return onChange(e.target.checked);
  }

  if (!state) return null;
  const poolReserve = utils.prettyNumber(ssjs.undecimalize(reserve, mint.decimals));
  const poolLPT = utils.prettyNumber(ssjs.undecimalize(lpt, 9));
  const price = utils.prettyNumber(ssjs.div(ssjs.decimalize(lpt, mint.decimals), ssjs.decimalize(reserve, 9)));

  return <TableRow>
    <TableCell align="center">
      <Switch checked={checked} onChange={onActive} color="primary" size="small" />
    </TableCell>
    <TableCell>
      <Typography>{address}</Typography>
    </TableCell>
    <TableCell>
      <MintAvatar icon={mint.icon} title={mint.name} />
    </TableCell>
    <TableCell align="right">
      <Typography>{poolReserve}</Typography>
    </TableCell>
    <TableCell align="right">
      <Typography>{poolLPT}</Typography>
    </TableCell>
    <TableCell align="right">
      <Typography>{price}</Typography>
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
    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    return this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { networkAddress: prevNetworkAddress } = prevProps;
    const { networkAddress } = this.props;
    if (!isEqual(networkAddress, prevNetworkAddress)) this.fetchData();
  }

  onRefresh = () => {
    return this.fetchData(true);
  }

  fetchData = (force = false) => {
    const { networkAddress, getPools, getPool, getPoolData, setError } = this.props;
    const { page, limit } = this.state
    if (!ssjs.isAddress(networkAddress)) return this.setState({ lasttime: new Date() });
    return this.setState({ loading: true, lasttime: new Date() }, () => {
      return getPools({ network: networkAddress }, limit, page + 1).then(data => {
        return Promise.all(data.map(({ _id }) => getPool(_id)));
      }).then(data => {
        return Promise.all(data.map(({ address }) => getPoolData(address, force)));
      }).then(data => {
        return this.setState({ data, loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onActive = (data, nextState) => {
    const { unlockWallet, setError } = this.props;
    const action = nextState ? this.swap.thawPool : this.swap.freezePool;
    const { network, address } = data;
    return unlockWallet().then(secretKey => {
      const payer = ssjs.fromSecretKey(secretKey);
      return action(network, address, payer);
    }).then(txId => {
      return this.onRefresh();
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { data, loading, lasttime } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer component={Paper} className={classes.card} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <IconButton size="small" color="primary" onClick={this.onRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={21} /> : <UpdateRounded />}
                  </IconButton>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Pool</Typography>
                </TableCell>
                <TableCell />
                <TableCell align="right">
                  <Typography variant="body2">Reserve</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">LPT</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">Price</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data.length ? <TableRow>
                <TableCell>
                  <Typography className={classes.subtitle}>No data</Typography>
                </TableCell>
              </TableRow> : null}
              {data.map(poolData => <Row
                key={poolData.address}
                data={poolData}
                onChange={e => this.onActive(poolData, e)}
              />)}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Typography className={classes.subtitle}>Last updated on: {utils.prettyDatetime(lasttime)}</Typography>
          </Grid>
        </Grid>
      </Grid>
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
  getPools, getPool,
  getPoolData,
  setError,
  unlockWallet,
}, dispatch);

Pools.defaultProps = {
  networkAddress: '',
  readOnly: false,
}

Pools.propTypes = {
  networkAddress: PropTypes.string,
  readOnly: PropTypes.bool,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Pools)));