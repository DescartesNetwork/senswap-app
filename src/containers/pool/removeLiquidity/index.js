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
import { setError, setSuccess } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';


class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      amount: '',
    }

    this.swap = window.senswap.swap;
  }

  onAmount = (amount) => {
    if (parseFloat(amount).toString() !== amount) return;
    return this.setState({ amount });
  }

  onPercentage = (percentage) => {
    const { accountData: { amount: balance, mint } } = this.props;
    const { decimals } = mint || {}
    const amount = ssjs.undecimalize(balance, decimals) * percentage;
    return this.setState({ amount });
  }

  onAutogenDestinationAddress = async (mintAddress) => {
    if (!mintAddress) throw new Error('Unknown token');
    const { wallet: { accounts }, updateWallet } = this.props;
    const { address } = await sol.newAccount(mintAddress);
    const newAccounts = [...accounts];
    if (!newAccounts.includes(address)) newAccounts.push(address);
    updateWallet({ accounts: newAccounts });
    return address;
  }

  removeLiquidity = async () => {
    const {
      accountData: { pool, mint: { decimals } },
      setError, setSuccess, onClose
    } = this.props;
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

    this.setState({ loading: true });
    try {
      const dstAddressS = await this.onAutogenDestinationAddress(mintAddressS);
      const dstAddressA = await this.onAutogenDestinationAddress(mintAddressA);
      const dstAddressB = await this.onAutogenDestinationAddress(mintAddressB);
      const { txId } = await this.swap.removeLiquidity(
        lpt, poolAddress,
        dstAddressS, dstAddressA, dstAddressB,
        window.senswap.wallet
      );
      await setSuccess('Remove liquidity successfully', utils.explorer(txId));
      return this.setState({ loading: false }, onClose);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  render() {
    const { classes, accountData, visible, onClose } = this.props;
    const { loading, amount } = this.state;

    const { amount: balance, pool, mint } = accountData;
    const { supply, decimals } = mint || {}
    const { mint_s, mint_a, mint_b, reserve_s, reserve_a, reserve_b } = pool || {};

    const treasuries = [
      { reserve: reserve_s, mint: mint_s },
      { reserve: reserve_a, mint: mint_a },
      { reserve: reserve_b, mint: mint_b },
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
                  const { reserve, mint } = treasuryData || {}
                  const { icon, symbol, decimals } = mint || {}
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  updateWallet,
}, dispatch);

RemoveLiquidity.defaultProps = {
  visible: false,
  accountData: {},
  onClose: () => { },
}

RemoveLiquidity.propTypes = {
  visible: PropTypes.bool,
  accountData: PropTypes.object,
  onClose: PropTypes.func,
}


export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));
