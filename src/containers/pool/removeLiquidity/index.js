import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  RemoveCircleOutlineRounded, PublicRounded, ArrowForwardRounded,
  OfflineBoltRounded,
} from '@material-ui/icons';

import PoolSelection from './poolSelection';
import LPTSelection from 'containers/wallet/components/lptSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolData: {},
      dstAddress: '',
      lptData: {},
      amount: 0,
    }

    this.swap = window.senswap.swap;
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onMax = () => {
    const { lptData: { lpt, pool } } = this.state;
    const { mint } = pool || {}
    const { decimals } = mint || {}
    const amount = ssjs.undecimalize(lpt, decimals);
    return this.setState({ amount });
  }

  onClear = () => {
    return this.setState({ ...EMPTY });
  }

  onPoolData = (poolData = {}) => {
    return this.setState({ poolData });
  }

  onLPTAddress = (lptAddress) => {
    const { getLPTData, setError } = this.props;
    if (!ssjs.isAddress(lptAddress)) return this.setState({ lptData: {} });
    return getLPTData(lptAddress).then(lptData => {
      return this.setState({ lptData });
    }).catch(er => {
      return setError(er);
    });
  }

  onDestinationAddress = (dstAddress) => {
    return this.setState({ dstAddress });
  }

  onAutogenDestinationAddress = (mintAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!secretKey) return reject('Cannot unlock account');
      if (!mintAddress) return reject('Unknown token');
      const { wallet: { user, accounts }, updateWallet } = this.props;
      const { dstAddress } = this.state;
      if (dstAddress) return resolve(dstAddress);

      let accountAddress = null;
      return sol.newAccount(mintAddress, secretKey).then(({ address }) => {
        accountAddress = address;
        const newMints = [...user.mints];
        if (!newMints.includes(mintAddress)) newMints.push(mintAddress);
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ user: { ...user, mints: newMints }, accounts: newAccounts });
      }).then(re => {
        return resolve(accountAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  removeLiquidity = () => {
    const { setError, unlockWallet } = this.props;
    const {
      amount, poolData: { address: poolAddress, mint, treasury },
      lptData: { is_initialized, address: lptAddress }
    } = this.state;
    const { address: mintAddress } = mint || {}
    const { address: treasuryAddress } = treasury || {}
    if (!is_initialized) return setError('Please wait for data loaded');
    if (!amount || !parseFloat(amount)) return setError('Invalid amount');
    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(mintAddress, secretKey);
      }).then(dstAddress => {
        const lpt = ssjs.decimalize(parseFloat(amount), 9);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.removeLiquidity(
          lpt,
          poolAddress,
          treasuryAddress,
          lptAddress,
          dstAddress,
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
      loading, txId,
      amount, poolData: { address: poolAddress, reserve, lpt: value, mint },
      lptData: { is_initialized, lpt }
    } = this.state;
    const { decimals } = mint || {}

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Pool info</Typography>
      </Grid>
      <Grid item xs={6}>
        <PoolSelection onChange={this.onPoolData} />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="LPT Amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          disabled={!is_initialized}
          InputProps={{
            endAdornment: <Tooltip title="Maximum amount">
              <IconButton edge="end" onClick={this.onMax}>
                <OfflineBoltRounded />
              </IconButton>
            </Tooltip>
          }}
          helperText={<span>Available LPT: <strong>{utils.prettyNumber(ssjs.undecimalize(lpt, 9))}</strong></span>}
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
                label="Destination Address"
                poolAddress={poolAddress}
                onChange={this.onDestinationAddress}
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
                <Typography variant="h6" align="center"><span className={classes.subtitle}>Value</span> {utils.prettyNumber(ssjs.undecimalize(value, 9))}</Typography>
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
              startIcon={loading ? <CircularProgress size={17} /> : <RemoveCircleOutlineRounded />}
              onClick={this.removeLiquidity}
              disabled={loading || !is_initialized}
              fullWidth
            >
              <Typography variant="body2">Remove</Typography>
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
  unlockWallet, updateWallet,
  getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));