import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';

import { CloseRounded, ArrowDownwardRounded } from 'senswap-ui/icons';

import TextInput from 'components/textInput';
import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      amount: '',
    }

    this.swap = window.senswap.swap;
  }

  onAmount = (amount) => {
    if (parseFloat(amount).toString() !== amount) return;
    return this.setState({ amount });
  }

  onPercentage = (percentage) => {
    const { data: { amount: balance, mint } } = this.props;
    const { decimals } = mint || {}
    const amount = ssjs.undecimalize(balance, decimals) * percentage;
    return this.setState({ amount });
  }

  onAutogenDestinationAddress = (mintAddress) => {
    return new Promise((resolve, reject) => {
      if (!mintAddress) return reject('Unknown token');
      const { wallet: { accounts }, updateWallet } = this.props;
      let accountAddress = null;
      return sol.newAccount(mintAddress).then(({ address }) => {
        accountAddress = address;
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ accounts: newAccounts });
      }).then(re => {
        return resolve(accountAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  removeLiquidity = () => {
    const { data: { pool, mint: { decimals } }, setError, onClose } = this.props;
    const { amount } = this.state;

    const lpt = ssjs.decimalize(amount, decimals);
    const { address: poolAddress, mint_s, mint_a, mint_b } = pool || {};
    const { address: mintAddressS } = mint_s || {}
    const { address: mintAddressA } = mint_a || {}
    const { address: mintAddressB } = mint_b || {}

    if (!lpt) return setError('Invalid amount');
    if (!ssjs.isAddress(poolAddress)) return setError('Invalid pool address');
    if (!ssjs.isAddress(mintAddressS)) return setError('Invalid primary mint address');
    if (!ssjs.isAddress(mintAddressA)) return setError('Invalid secondary mint address');
    if (!ssjs.isAddress(mintAddressB)) return setError('Invalid secondary mint address');

    let dstAddressS = '';
    let dstAddressA = '';
    let dstAddressB = '';
    return this.setState({ loading: true }, () => {
      return this.onAutogenDestinationAddress(mintAddressS).then(accountAddress => {
        dstAddressS = accountAddress;
        return this.onAutogenDestinationAddress(mintAddressA);
      }).then(accountAddress => {
        dstAddressA = accountAddress;
        return this.onAutogenDestinationAddress(mintAddressB);
      }).then(accountAddress => {
        dstAddressB = accountAddress;
        return this.swap.removeLiquidity(
          lpt, poolAddress,
          dstAddressS, dstAddressA, dstAddressB,
          window.senswap.wallet
        );
      }).then(({ txId }) => {
        return this.setState({ ...EMPTY, txId }, () => {
          return onClose();
        });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes, data, visible, onClose } = this.props;
    const { loading, amount } = this.state;

    const { amount: balance, pool, mint } = data;
    const { supply, decimals } = mint || {}
    const { mint_s, mint_a, mint_b, treasury_s, treasury_a, treasury_b } = pool || {};

    const treasuries = [
      { ...treasury_s, mint: { ...(treasury_s || {}).mint, ...mint_s } },
      { ...treasury_a, mint: { ...(treasury_a || {}).mint, ...mint_a } },
      { ...treasury_b, mint: { ...(treasury_b || {}).mint, ...mint_b } },
    ];
    const ratio = ssjs.div(ssjs.decimalize(amount, decimals), supply);

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1">Remove Liquidity</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container justify="center">
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography>Amount</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextInput
                    variant="h2"
                    onChange={this.onAmount}
                    value={amount}
                    focus
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption">{`Available: ${utils.prettyNumber(ssjs.undecimalize(balance, decimals))} LPT`}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain size={1} />
                </Grid>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.onPercentage(0.25)}
                        fullWidth
                      >
                        <Typography color="primary">25%</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.onPercentage(0.5)}
                        fullWidth
                      >
                        <Typography color="primary">50%</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.onPercentage(0.75)}
                        fullWidth
                      >
                        <Typography color="primary">75%</Typography>
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => this.onPercentage(1)}
                        fullWidth
                      >
                        <Typography color="primary">MAX</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item>
            <IconButton size="small">
              <ArrowDownwardRounded />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid container>
                {treasuries.map((treasuryData, index) => {
                  const { amount: reserve, mint } = treasuryData;
                  const { icon, symbol, decimals } = mint;
                  return <Grid item key={index} xs={12}>
                    <Grid container alignItems="center" className={classes.noWrap}>
                      <Grid item className={classes.stretch}>
                        <Grid container alignItems="center" className={classes.noWrap}>
                          <Grid item>
                            <MintAvatar icon={icon} />
                          </Grid>
                          <Grid item >
                            <Typography>{symbol}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Typography align="right">{utils.prettyNumber(ratio * ssjs.undecimalize(reserve, decimals))}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                })}
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={loading ? <CircularProgress size={17} /> : null}
              disabled={loading}
              onClick={this.removeLiquidity}
              fullWidth
            >
              <Typography>Withdraw</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet,
}, dispatch);

RemoveLiquidity.defaultProps = {
  visible: false,
  data: {},
  onClose: () => { },
}

RemoveLiquidity.propTypes = {
  visible: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
}


export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));