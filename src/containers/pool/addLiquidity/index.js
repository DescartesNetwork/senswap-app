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
import Popover from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  HelpOutlineRounded, AddCircleOutlineRounded, SettingsRounded,
  PublicRounded, ArrowForwardRounded, OfflineBoltRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
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
  anchorEl: null,
}

class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolData: {},
      srcAddress: '',
      srcData: {},
      lptAddress: '',
      amount: 0,
      advance: false,
    }

    this.swap = window.senwallet.swap;
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAdvance = (e) => {
    const advance = e.target.checked || false;
    return this.setState({ advance });
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
    return getAccountData(srcAddress).then(srcData => {
      return this.setState({ srcAddress, srcData });
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
      amount, srcAddress,
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
        const reserve = global.BigInt(parseFloat(amount) * 10 ** decimals);
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
    const {
      anchorEl, advance, loading, txId, amount,
      poolData: { state, address: poolAddress, lpt, reserve },
      srcData: { amount: balance, mint }
    } = this.state;
    const { symbol, decimals } = mint || {};

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Pool info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={this.onOpen}>
              <SettingsRounded color="secondary" fontSize="small" />
            </IconButton>
            <Popover
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.onClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <BaseCard>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">Interface Settings</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                      <Grid item>
                        <Typography>Expert mode</Typography>
                      </Grid>
                      <Grid item className={classes.stretch}>
                        <Tooltip title="The LPT account will be selected, or generated automatically by default. By enabling expert mode, you can controll it by hands.">
                          <IconButton size="small">
                            <HelpOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Switch
                          color="primary"
                          checked={advance}
                          onChange={this.onAdvance}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </BaseCard>
            </Popover>
          </Grid>
        </Grid>
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
                <Typography variant="h4" align="center"><span className={classes.subtitle}>Reserve</span> {utils.prettyNumber(ssjs.undecimalize(reserve, decimals))}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h4" align="center"><span className={classes.subtitle}>Price</span> {utils.prettyNumber(ssjs.div(lpt, reserve))}</Typography>
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