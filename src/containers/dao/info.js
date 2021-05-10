import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drain from 'senswap-ui/drain';

import {
  EcoRounded, MonetizationOnRounded, LocalGasStation,
  OfflineBoltRounded
} from '@material-ui/icons';

import NetworkSelection from 'containers/wallet/components/networkSelection';
import Token from './token';
import Pools from './pools';

import styles from './styles';
import utils from 'helpers/utils';
import { unlockWallet } from 'modules/wallet.reducer';
import { setError } from 'modules/ui.reducer';


class NetworkInfo extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
      amount: 0,
      dstAddress: '',
      loading: false,
    }

    this.swap = window.senswap.swap;
  }

  onData = (data) => {
    return this.setState({ data });
  }

  earn = () => {
    const { unlockWallet, setError } = this.props;
    const { data, amount: _amount, dstAddress } = this.state;
    if (!ssjs.isAddress(dstAddress)) return setError('Invalid receipient address');
    if (!_amount || !parseFloat(_amount)) return setError('Invalid amount');

    const { address: networkAddress, primary, vault } = data;
    const { address: vaultAddress } = vault || {}
    const { decimals } = primary || {}
    if (!decimals) return setError('Invalid data');
    const amount = ssjs.decimalize(_amount, decimals);
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.earn(amount, networkAddress, vaultAddress, dstAddress, payer);
      }).then(txId => {
        return this.setState({ amount: 0, dstAddress: '', loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onMax = () => {
    const { data: { vault, primary } } = this.state;
    const { amount } = vault || {}
    const { decimals } = primary || {}
    return this.setState({ amount: ssjs.undecimalize(amount, decimals) });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onAddress = (e) => {
    const dstAddress = e.target.value || '';
    return this.setState({ dstAddress });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { role } } } = this.props;
    const { data, dstAddress, amount, loading } = this.state;
    const mints = data.mints || [];
    const vault = data.vault || {};
    const primary = data.primary || {};
    const sen = utils.prettyNumber(ssjs.undecimalize(vault.amount, primary.decimals));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <NetworkSelection onChange={this.onData} />
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Typography variant="h3">{sen}<span className={classes.subtitle}> 𑁍 SEN</span></Typography>
          </Grid>
          <Grid item xs={12} >
            <Grid container spacing={2} justify="center" alignItems="center" className={classes.noWrap}>
              <Grid item>
                <TextField
                  variant="outlined"
                  color="secondary"
                  label="Amount"
                  onChange={this.onAmount}
                  value={amount}
                  size="small"
                  InputProps={{
                    endAdornment: <Tooltip title="Maximum amount">
                      <IconButton edge="end" size="small" onClick={this.onMax}>
                        <OfflineBoltRounded />
                      </IconButton>
                    </Tooltip>
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item>
                <TextField
                  variant="outlined"
                  color="secondary"
                  label="Receipient"
                  onChange={this.onAddress}
                  value={dstAddress}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={loading ? <CircularProgress size={17} /> : <EcoRounded />}
                  className={classes.earn}
                  onClick={this.earn}
                >
                  <Typography>Earn</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Tokens listed in Network</Typography>
          </Grid>
          <Grid item>
            <IconButton size="small" color="secondary">
              <MonetizationOnRounded fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.network}>
        <Grid container spacing={1}>
          {mints.map((address, index) => <Grid item key={index}>
            <Token address={address} readOnly />
          </Grid>)}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Pools in Network</Typography>
          </Grid>
          <Grid item>
            <IconButton size="small" color="secondary">
              <LocalGasStation fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Pools networkAddress={data.address} readOnly={role !== 'admin'} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  unlockWallet,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkInfo)));