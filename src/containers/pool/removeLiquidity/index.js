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
  HelpOutlineRounded, RemoveCircleOutlineRounded, SettingsRounded,
  PublicRounded, ArrowForwardRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import PoolSelection from './poolSelection';
import LPTSelection from 'containers/wallet/components/lptSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet, syncWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
  anchorEl: null,
}

class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolAddress: '',
      dstAddress: '',
      lptData: {},
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

  onClear = () => {
    return this.setState({ ...EMPTY });
  }

  onPoolAddress = (poolAddress) => {
    return this.setState({ poolAddress });
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
      const {
        wallet: { user, accounts },
        updateWallet, syncWallet
      } = this.props;
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
        return syncWallet(secretKey);
      }).then(re => {
        return resolve(accountAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  removeLiquidity = () => {
    const {
      amount, poolAddress,
      lptData: {
        is_initialized,
        address: lptAddress,
        pool: {
          mint: { address: mintAddress, decimals },
          treasury: { address: treasuryAddress }
        }
      },
    } = this.state;
    const { setError, unlockWallet } = this.props;
    if (!is_initialized) return setError('Please wait for data loaded');
    if (!amount || !parseFloat(amount)) return setError('Invalid amount');
    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(mintAddress, secretKey);
      }).then(dstAddress => {
        const lpt = global.BigInt(parseFloat(amount) * 10 ** decimals);
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
    const {
      anchorEl, advance, loading, txId,
      amount, poolAddress,
      lptData: { is_initialized, lpt, pool }
    } = this.state;
    const { mint } = is_initialized ? pool : {};

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
        <PoolSelection onChange={this.onPoolAddress} />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="LPT Amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          helperText={`Your LPT: ${is_initialized ? utils.prettyNumber(utils.div(lpt, global.BigInt(10 ** mint.decimals))) : 0}`}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h5" align="center">
          {is_initialized ? utils.prettyNumber(utils.div(pool.reserve, global.BigInt(10 ** mint.decimals))) : 0}
        </Typography>
        <Typography variant="body2" align="center">Reserve</Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h5" align="center">
          {is_initialized ? utils.prettyNumber(utils.div(pool.lpt, global.BigInt(10 ** mint.decimals))) : 0}</Typography>
        <Typography variant="body2" align="center">In-pool LPT</Typography>
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
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet, updateWallet, syncWallet,
  getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));