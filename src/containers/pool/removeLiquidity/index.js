import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

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
import LPTSelection from './lptSelection';
import AccountSelection from './accountSelection';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { getSecretKey, updateWallet } from 'modules/wallet.reducer';


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
      lptAddress: '',
      dstAddress: '',
      amount: 0,
      data: {},
      advance: false,
    }
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
    return this.setState({ poolAddress }, () => {
      if (!sol.isAddress(poolAddress)) return console.error('Invalid address');
      return sol.getPurePoolData(poolAddress).then(data => {
        return this.setState({ data });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  onLPTAddress = (lptAddress) => {
    return this.setState({ lptAddress });
  }

  onDestinationAddress = (dstAddress) => {
    return this.setState({ dstAddress });
  }

  onAutogenDestinationAddress = (tokenAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!tokenAddress || !secretKey) return reject('Invalid input');
      const { dstAddress } = this.state;
      if (dstAddress) return resolve(dstAddress);

      let newAddress = null;
      const { wallet: { user }, updateWallet } = this.props;
      const payer = sol.fromSecretKey(secretKey);
      const tokenPublicKey = sol.fromAddress(tokenAddress);
      return sol.newSRC20Account(tokenPublicKey, payer).then(tokenAccount => {
        const tokenAccounts = [...user.tokenAccounts];
        newAddress = tokenAccount.publicKey.toBase58();
        tokenAccounts.push(newAddress);
        return updateWallet({ ...user, tokenAccounts });
      }).then(re => {
        return resolve(newAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  removeLiquidity = () => {
    const {
      amount, poolAddress, lptAddress,
      data: { initialized, token, treasury }
    } = this.state;
    const { getSecretKey } = this.props;
    if (!amount || !initialized) return console.error('Invalid input');
    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return getSecretKey().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(token.address, secretKey);
      }).then(dstAddress => {
        const lpt = global.BigInt(amount) * 10n ** global.BigInt(token.decimals);
        const lptPublicKey = sol.fromAddress(lptAddress);
        const poolPublicKey = sol.fromAddress(poolAddress);
        const treasuryPublicKey = sol.fromAddress(treasury.address);
        const dstTokenPublickKey = sol.fromAddress(dstAddress);
        const tokenPublicKey = sol.fromAddress(token.address);
        const payer = sol.fromSecretKey(secretKey);
        return sol.removeLiquidity(
          lpt,
          poolPublicKey,
          treasuryPublicKey,
          lptPublicKey,
          dstTokenPublickKey,
          tokenPublicKey,
          payer
        );
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        console.error(er);
        return this.setState({ ...EMPTY });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const {
      anchorEl, advance, loading, txId,
      amount, poolAddress,
      data: { initialized, reserve, lpt, token }
    } = this.state;

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
          fullWidth
        />
      </Grid>
      {initialized ? <Grid item xs={6}>
        <Typography variant="h5" align="center">{utils.prettyNumber(utils.div(reserve, global.BigInt(10 ** token.decimals)))}</Typography>
        <Typography variant="body2" align="center">Reserve</Typography>
      </Grid> : null}
      {initialized ? <Grid item xs={6}>
        <Typography variant="h5" align="center">{utils.prettyNumber(utils.div(lpt, global.BigInt(10 ** token.decimals)))}</Typography>
        <Typography variant="body2" align="center">Total LPT</Typography>
      </Grid> : null}
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
          <Grid item xs={12}>
            <Typography variant="body2">Done! Click the button to view the transaction.</Typography>
          </Grid>
          <Grid item xs={8}>
            <Button
              variant="contained"
              color="secondary"
              href={configs.sol.explorer(txId)}
              target="_blank"
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
              <Typography>Skip</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid> : <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={17} /> : <RemoveCircleOutlineRounded />}
            onClick={this.removeLiquidity}
            disabled={loading || !initialized}
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getSecretKey, updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));