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
  HelpOutlineRounded, AddCircleOutlineRounded, SettingsRounded,
  PublicRounded, ArrowForwardRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import LPTSelection from './lptSelection';
import AccountSelection from './accountSelection';
import TokenSelection from './tokenSelection';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';


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
      poolAddress: '',
      srcAddress: '',
      lptAddress: '',
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
    return this.setState({ txId: '' });
  }

  onPoolAddress = (address) => {
    return this.setState({ poolAddress: address }, () => {
      const { poolAddress } = this.state;
      if (!sol.isAddress(poolAddress)) return;
      return sol.getPurePoolData(poolAddress).then(data => {
        return this.setState({ data });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  onSourceAddress = (srcAddress) => {
    return this.setState({ srcAddress });
  }

  onLPTAddress = (address) => {
    const lptAddress = address || '';
    return this.setState({ lptAddress });
  }

  onAutogenLPTAddress = (secretKey) => {
    return new Promise((resolve, reject) => {
      if (!secretKey) return reject('Invalid input');
      const { lptAddress } = this.state;
      if (lptAddress) return resolve(lptAddress);

      const payer = sol.fromSecretKey(secretKey);
      return sol.newLPTAccount(payer).then(lptAccount => {
        return resolve(lptAccount);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  addLiquidity = () => {
    const {
      amount, srcAddress, poolAddress,
      data: { initialized, token, treasury }
    } = this.state;
    const { getSecretKey } = this.props;
    if (!initialized || !amount) return console.error('Invalid input');

    let secretKey = null;
    let lptAddressOrAccount = null;
    let txId = null;
    return this.setState({ ...EMPTY, loading: true }, () => {
      return getSecretKey().then(re => {
        secretKey = re;
        return this.onAutogenLPTAddress(secretKey);
      }).then(re => {
        lptAddressOrAccount = re;
        const reserve = global.BigInt(amount) * global.BigInt(10 ** token.decimals);
        const poolPublicKey = sol.fromAddress(poolAddress);
        const treasuryPublicKey = sol.fromAddress(treasury.address);
        const srcTokenPublickKey = sol.fromAddress(srcAddress);
        const tokenPublicKey = sol.fromAddress(token.address);
        const payer = sol.fromSecretKey(secretKey);
        const lpt = typeof lptAddressOrAccount === 'string' ? sol.fromAddress(lptAddressOrAccount) : lptAddressOrAccount;
        const addLiquidity = typeof lptAddressOrAccount === 'string' ? sol.addLiquidity : sol.addLiquidityWithNewLPTAccount;
        return addLiquidity(
          reserve,
          poolPublicKey,
          treasuryPublicKey,
          lpt,
          srcTokenPublickKey,
          tokenPublicKey,
          payer
        );
      }).then(re => {
        txId = re;
        const { wallet: { user }, updateWallet } = this.props;
        const lptAccounts = [...user.lptAccounts];
        const lptAddress = typeof lptAddressOrAccount === 'string' ? lptAddressOrAccount : lptAddressOrAccount.publicKey.toBase58()
        lptAccounts.push(lptAddress);
        return updateWallet({ ...user, lptAccounts });
      }).then(re => {
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
              <SettingsRounded />
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
      <Grid item xs={12}>
        <TokenSelection onChange={this.onPoolAddress} />
      </Grid>
      {initialized ? <Grid item xs={6}>
        <TextField
          label="Reserve"
          variant="outlined"
          value={utils.prettyNumber(utils.div(reserve, global.BigInt(10 ** token.decimals)))}
          fullWidth
        />
      </Grid> : null}
      {initialized ? <Grid item xs={6}>
        <TextField
          label="$ Price"
          variant="outlined"
          value={utils.div(lpt, reserve)}
          fullWidth
        />
      </Grid> : null}
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
        <TextField
          label="Additive amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      {txId ? <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Done! Click the button to view the transaction.</Typography>
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
            startIcon={loading ? <CircularProgress size={20} /> : <AddCircleOutlineRounded />}
            onClick={this.addLiquidity}
            disabled={loading}
            fullWidth
          >
            <Typography variant="body2">Add</Typography>
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
  updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));