import React, { Component, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { makeStyles, withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import { IconButton } from 'senswap-ui/button';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  VisibilityRounded, CloseRounded, UpdateRounded,
  EcoRounded,
} from '@material-ui/icons';

import LPTAvatar from 'containers/wallet/components/lptAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';


function Row(props) {
  const {
    data: {
      address: lptAddress,
      lpt,
      is_initialized,
      pool: {
        address: poolAddress,
        reserve: poolReserve,
        lpt: poolLPT,
        mint,
        treasury
      }
    },
    onCloseLPT
  } = props;
  const [visible, onVisible] = useState(false);
  const classes = makeStyles(styles)();

  if (!is_initialized) return null;
  const totalSupply = utils.prettyNumber(ssjs.undecimalize(mint.supply, mint.decimals));
  const lptAmount = utils.prettyNumber(ssjs.undecimalize(lpt, 9));
  const price = utils.prettyNumber(ssjs.div(ssjs.decimalize(poolLPT, mint.decimals), ssjs.decimalize(poolReserve, 9)));
  const reserve = utils.prettyNumber(ssjs.undecimalize(poolReserve, mint.decimals));
  const onOpen = () => onVisible(true);
  const onClose = () => onVisible(false);
  return <Fragment>
    <TableRow>
      <TableCell>
        <IconButton size="small" onClick={onOpen}>
          <VisibilityRounded />
        </IconButton>
      </TableCell>
      <TableCell>
        <LPTAvatar address={lptAddress} />
      </TableCell>
      <TableCell>
        <Typography>{lptAddress}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{mint.symbol || 'Unknown'}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{price}</Typography>
      </TableCell>
      <TableCell align="right">
        <Typography>{lptAmount}</Typography>
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" color="secondary" onClick={onCloseLPT}>
          <EcoRounded />
        </IconButton>
      </TableCell>
    </TableRow>
    <Dialog open={visible} onClose={onClose}>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Pool Info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">Pool</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField label="Pool Address" variant="outlined" value={poolAddress} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="LPT" variant="outlined" value={lptAmount} fullWidth />
          </Grid>
          <Grid item xs={8}>
            <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
          </Grid>
          <Grid item xs={4}>
            <TextField label="Reserve" variant="outlined" value={reserve} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">Token</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={mint.symbol || 'Unknown'}
              variant="outlined"
              value={mint.address}
              helperText={`Total supply: ${totalSupply} - Decimals: ${mint.decimals}`}
              fullWidth />
          </Grid>
          <Grid item xs={12} /> {/* Safe space */}
        </Grid>
      </DialogContent>
    </Dialog>
  </Fragment>
}

class Info extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
      loading: false,
      lasttime: new Date()
    }

    this.swap = window.senwallet.swap;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { lpts: prevLPTs }, bucket: prevBucket } = prevProps;
    const { wallet: { lpts }, bucket } = this.props;
    if (!isEqual(lpts, prevLPTs)) return this.fetchData();
    if (!isEqual(bucket, prevBucket)) return this.fetchData();
  }

  onRefresh = () => {
    return this.fetchData(true);
  }

  fetchData = (force = false) => {
    const { wallet: { lpts }, setError, getLPTData } = this.props;
    const { lasttime } = this.state;
    return this.setState({ loading: true, lasttime: force ? new Date() : lasttime }, () => {
      if (!lpts.length) return this.setState({ loading: false });
      return Promise.all(lpts.map(lptAddress => {
        return getLPTData(lptAddress, force);
      })).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onCloseLPT = ({ address: lptAddress }) => {
    const { unlockWallet, updateWallet, setError, wallet: { lpts } } = this.props;
    return unlockWallet().then(secretKey => {
      const payer = ssjs.fromSecretKey(secretKey);
      const dstAddress = payer.publicKey.toBase58();
      return this.swap.closeLPT(lptAddress, dstAddress, payer);
    }).then(txId => {
      const newLPTs = lpts.filter(lpt => (lpt !== lptAddress));
      return updateWallet({ lpts: newLPTs });
    }).then(re => {
      // Nothing
    }).catch(er => {
      return setError(er);
    })
  }

  render() {
    // const { classes } = this.props;
    const { data, loading, lasttime } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={this.onRefresh} disabled={loading}>
                    {loading ? <CircularProgress size={21} /> : <UpdateRounded />}
                  </IconButton>
                </TableCell>
                <TableCell />
                <TableCell>
                  <Typography variant="caption">LPT Account</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption">Token</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption">Price</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption">LPT</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption">Cleaner</Typography>
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
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow> : null}
              {data.map(data => <Row
                key={data.address}
                data={data}
                onCloseLPT={() => this.onCloseLPT(data)}
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
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet, updateWallet,
  getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));