import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';
import Tooltip from 'senswap-ui/tooltip';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';

import Collapse from '@material-ui/core/Collapse';

import {
  AddCircleOutlineRounded, PublicRounded, ArrowForwardRounded,
  OfflineBoltRounded,
} from 'senswap-ui/icons';

import LPTSelection from 'containers/wallet/components/lptSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';
import PoolSelection from './poolSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolData: {},
      srcData: {},
      lptAddress: '',
      amount: 0,
    }

    this.swap = window.senswap.swap;
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onMax = () => {
    const { srcData: { amount: balance, mint } } = this.state;
    const { decimals } = mint || {};
    const amount = ssjs.undecimalize(balance, decimals);
    return this.setState({ amount });
  }

  onClear = () => {
    return this.setState({ ...EMPTY });
  }

  onPoolData = (poolData = {}) => {
    return this.setState({ poolData });
  }

  onSourceAddress = (srcAddress) => {
    const { getAccountData, setError } = this.props;
    if (!ssjs.isAddress(srcAddress)) return this.setState({ srcData: {} });
    return getAccountData(srcAddress).then(srcData => {
      return this.setState({ srcData });
    }).catch(er => {
      return setError(er);
    });
  }

  onLPTAddress = (lptAddress) => {
    return this.setState({ lptAddress });
  }

  onAutogenLPTAddress = (poolAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!ssjs.isAddress(poolAddress)) return reject('Invalid pool address');
      if (!secretKey) return reject('Cannot unlock wallet');
      const {
        wallet: { user, lpts },
        updateWallet, syncWallet
      } = this.props;
      let { lptAddress } = this.state;
      if (lptAddress) return resolve(lptAddress);
      return sol.newLPT(poolAddress, secretKey).then(({ lpt }) => {
        const newPools = [...user.pools];
        if (!newPools.includes(poolAddress)) newPools.push(poolAddress);
        const newLPTs = [...lpts];
        const lptAddress = lpt.publicKey.toBase58();
        if (!newLPTs.includes(lptAddress)) newLPTs.push(lptAddress);
        return updateWallet({ user: { ...user, pools: newPools }, lpts: newLPTs });
      }).then(re => {
        return syncWallet(secretKey);
      }).then(re => {
        return resolve(lptAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  addLiquidity = () => {
    const { setError, unlockWallet } = this.props;
    const {
      amount, srcData: { address: srcAddress },
      poolData: { state, address: poolAddress, mint, treasury },
    } = this.state;
    const { decimals } = mint || {}
    const { address: treasuryAddress } = treasury || {}
    if (state !== 1) return setError('The pool is uninitilized or frozen');
    if (!amount || !parseFloat(amount)) return setError('Invalid amount');

    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenLPTAddress(poolAddress, secretKey);
      }).then(lptAddress => {
        const reserve = ssjs.decimalize(parseFloat(amount), decimals);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.addLiquidity(
          reserve,
          poolAddress,
          treasuryAddress,
          lptAddress,
          srcAddress,
          payer
        );
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { ui: { advance } } = this.props;
    const {
      loading, txId, amount,
      poolData: { state, address: poolAddress, lpt, reserve },
      srcData: { amount: balance, mint }
    } = this.state;
    const { symbol, decimals } = mint || {};

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Pool info</Typography>
      </Grid>
      <Grid item xs={6}>
        <PoolSelection onChange={this.onPoolData} />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Additive amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          InputProps={{
            endAdornment: <Tooltip title="Maximum amount">
              <IconButton edge="end" onClick={this.onMax}>
                <OfflineBoltRounded />
              </IconButton>
            </Tooltip>
          }}
          helperText={<span>Available {symbol}: <strong>{utils.prettyNumber(ssjs.undecimalize(balance, decimals))}</strong></span>}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <LPTSelection onChange={this.onLPTAddress} poolAddress={poolAddress} />
            </Grid>
            <Grid item xs={12}>
              <AccountSelection
                label="Source Address"
                poolAddress={poolAddress}
                onChange={this.onSourceAddress}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.action}>
          <Grid item xs={12}>
            <Grid container justify="space-around" spacing={2}>
              <Grid item>
                <Typography variant="h6" align="center"><span className={classes.subtitle}>Reserve</span> {utils.prettyNumber(ssjs.undecimalize(reserve, decimals))}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6" align="center"><span className={classes.subtitle}>Price</span> {utils.prettyNumber(ssjs.div(ssjs.decimalize(lpt, decimals), ssjs.decimalize(reserve, 9)))}</Typography>
              </Grid>
            </Grid>
          </Grid>
          {txId ? <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Button
                  variant="contained"
                  color="secondary"
                  href={utils.explorer(txId)}
                  target="_blank"
                  rel="noopener"
                  startIcon={<PublicRounded />}
                  fullWidth
                >
                  <Typography>Explore</Typography>
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  color="secondary"
                  onClick={this.onClear}
                  endIcon={<ArrowForwardRounded />}
                  fullWidth
                >
                  <Typography>Done</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid> : <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={17} /> : <AddCircleOutlineRounded />}
              onClick={this.addLiquidity}
              disabled={loading || state !== 1}
              fullWidth
            >
              <Typography variant="body2">Add</Typography>
            </Button>
          </Grid>}
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
  updateWallet, unlockWallet, syncWallet,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));