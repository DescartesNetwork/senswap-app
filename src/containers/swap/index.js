import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';

import {
  HelpOutlineRounded, PublicRounded, SettingsRounded,
  ArrowForwardRounded, SwapHorizRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import Bid from './bid';
import Ask from './ask';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  txId: '',
  anchorEl: null,
}

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      advance: false,

      srcAddress: '',
      bidAmount: 0,
      bidAddress: '',
      bidData: {},

      dstAddress: '',
      askAmount: 0,
      askAddress: '',
      askData: {},

      ratio: 0,
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

  onClear = () => {
    return this.setState({ txId: '' });
  }

  estimateAmount = () => {
    const {
      bidAmount,
      bidData: {
        is_initialized: bidInitialized,
        reserve: bidReserve,
        lpt: bidLPT,
        mint: bidMint,
      },
      askData: {
        is_initialized: askInitialized,
        reserve: askReserve,
        lpt: askLPT,
        mint: askMint,
        fee: askFee,
      }
    } = this.state;
    if (!bidAmount || !bidInitialized || !askInitialized) return this.setState({ slippage: 0, ratio: 0, askAmount: 0 });
    const newBidReserve = bidReserve + ssjs.decimalize(bidAmount, bidMint.decimals);
    const newAskReserve = ssjs.curve(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const paidAmountWithoutFee = askReserve - newAskReserve;
    const paidAmountWithFee = paidAmountWithoutFee * (global.BigInt(10 ** 9) - askFee) / global.BigInt(10 ** 9);
    const askAmount = ssjs.undecimalize(paidAmountWithFee, askMint.decimals);
    return this.setState({ slippage, ratio, askAmount });
  }

  estimateInverseAmount = () => {
    const {
      bidData: {
        is_initialized: bidInitialized,
        reserve: bidReserve,
        lpt: bidLPT,
        mint: bidMint,
      },
      askAmount,
      askData: {
        is_initialized: askInitialized,
        reserve: askReserve,
        lpt: askLPT,
        mint: askMint,
        fee: askFee,
      }
    } = this.state;
    if (!askAmount || !bidInitialized || !askInitialized) return this.setState({ slippage: 0, ratio: 0, askAmount: 0 });
    const askAmountWithFee = ssjs.decimalize(askAmount, bidMint.decimals);
    const askAmountWithoutFee = askAmountWithFee * global.BigInt(10 ** 9) / (global.BigInt(10 ** 9) - askFee);
    const newAskReserve = askReserve - askAmountWithoutFee;
    const newBidReserve = ssjs.inverseCurve(newAskReserve, bidReserve, bidLPT, askReserve, askLPT);
    const slippage = ssjs.slippage(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const ratio = ssjs.ratio(newBidReserve, bidReserve, bidLPT, askReserve, askLPT);
    const bidAmount = ssjs.undecimalize(newBidReserve - bidReserve, askMint.decimals);
    return this.setState({ slippage, ratio, bidAmount });
  }

  onBid = ({ amount, poolData, accountAddress }) => {
    return this.setState({
      bidAmount: amount,
      bidData: poolData,
      srcAddress: accountAddress,
    }, this.estimateAmount);
  }

  onAsk = ({ amount, poolData, accountAddress }) => {
    return this.setState({
      askAmount: amount,
      askData: poolData,
      dstAddress: accountAddress,
    }, this.estimateInverseAmount);
  }

  onAutogenDestinationAddress = (mintAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      const { dstAddress } = this.state;
      const { wallet: { user, accounts }, updateWallet, syncWallet } = this.props;
      if (!ssjs.isAddress(mintAddress) || !secretKey) return reject('Invalid input');
      if (ssjs.isAddress(dstAddress)) return resolve(dstAddress);

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

  onSwap = () => {
    const { setError, unlockWallet } = this.props;
    const {
      bidAmount, srcAddress,
      bidData: {
        is_initialized: bidInitialized,
        address: bidAddress,
        mint: bidMint,
        treasury: bidTreasury
      },
      askData: {
        is_initialized: askInitialized,
        address: askAddress,
        mint: askMint,
        treasury: askTreasury
      }
    } = this.state;

    if (!bidInitialized || !askInitialized) return setError('Please wait for data loaded');
    if (!bidAmount) return setError('Invalid bid amount');
    if (!ssjs.isAddress(srcAddress)) return setError('Invalid source address');

    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(askMint.address, secretKey);
      }).then(dstAddress => {
        const amount = global.BigInt(bidAmount * 10 ** bidMint.decimals);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.swap(
          amount,
          bidAddress,
          bidTreasury.address,
          srcAddress,
          askAddress,
          askTreasury.address,
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
      bidAmount, bidData: { is_initialized: bidInitialized, mint: bidMint },
      askAmount, askData: { is_initialized: askInitialized, mint: askMint, fee },
      slippage, ratio, txId, loading, advance, anchorEl
    } = this.state;
    const { bidDecimals } = bidMint || {}
    const { askDecimals } = askMint || {}

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} lg={8}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} sm={8} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Typography variant="h4">Swap</Typography>
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
                                  <Tooltip title="The token account will be selected, or generated automatically by default. By enabling expert mode, you can controll it by hands.">
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
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <Bid advance={advance} value={ssjs.undecimalize(bidAmount, bidDecimals)} onChange={this.onBid} />
                </Grid>
                <Grid item xs={12}>
                  <Ask advance={advance} value={ssjs.undecimalize(askAmount, askDecimals)} onChange={this.onAsk} />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} className={classes.action}>
                    <Grid item xs={12}>
                      <Grid container justify="space-around" spacing={2}>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Fee</span> {ssjs.undecimalize(fee, 9)}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Ratio</span> {utils.prettyNumber(ratio)}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Slippage</span> {utils.prettyNumber(slippage)}</Typography>
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
                        onClick={this.onSwap}
                        startIcon={loading ? <CircularProgress size={17} /> : <SwapHorizRounded />}
                        disabled={loading || !bidInitialized || !askInitialized}
                        fullWidth
                      >
                        <Typography variant="body2">Swap</Typography>
                      </Button>
                    </Grid>}
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet, syncWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));