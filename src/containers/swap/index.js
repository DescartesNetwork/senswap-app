import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Collapse from '@material-ui/core/Collapse';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Popover from '@material-ui/core/Popover';

import {
  HelpOutlineRounded, PublicRounded, SettingsRounded,
  ArrowForwardRounded, SwapHorizRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import TokenSelection from './tokenSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet } from 'modules/wallet.reducer';
import { getPoolData } from 'modules/bucket.reducer';

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
      srcData: {},
      dstData: {},
      bidAmount: 0,
      askAmount: 0,
      bidData: {},
      askData: {},
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
        initialized: bidInitialized,
        reserve: bidReserve,
        lpt: bidLPT,
        token: bidToken,
      },
      askData: {
        initialized: askInitialized,
        reserve: askReserve,
        lpt: askLPT,
        token: askToken,
        fee_numerator: askFeeNumerator,
        fee_denominator: askFeeDenominator,
      }
    } = this.state;
    if (!bidAmount || !bidInitialized || !askInitialized) return this.setState({ askAmount: 0 });
    const _bidAmount = parseInt(bidAmount) || 0;
    const _bidReserve = utils.div(bidReserve, global.BigInt(10 ** bidToken.decimals));
    const _newBidReserve = _bidReserve + _bidAmount;
    const _bidLPT = utils.div(bidLPT, global.BigInt(10 ** bidToken.decimals));
    const _askReserve = utils.div(askReserve, global.BigInt(10 ** askToken.decimals));
    const _askLPT = utils.div(askLPT, global.BigInt(10 ** askToken.decimals));

    const alpha = _bidReserve / _newBidReserve;
    const reversedAlpha = 1 / alpha;
    const lambda = _bidLPT / _askLPT;
    const b = (reversedAlpha - alpha) * lambda;
    const sqrtDelta = Math.sqrt(b ** 2 + 4);
    const beta = (sqrtDelta - b) / 2;

    const newAskReserveWithoutFee = _askReserve * beta;
    const paidAmountWithoutFee = _askReserve - newAskReserveWithoutFee;
    const paidAmountWithFee = paidAmountWithoutFee * utils.div(askFeeDenominator - askFeeNumerator, askFeeDenominator);
    return this.setState({ askAmount: paidAmountWithFee });
  }

  onBidAmount = (e) => {
    const bidAmount = e.target.value || '';
    return this.setState({ bidAmount }, this.estimateAmount);
  }

  onBidAddress = (bidAddress) => {
    const { setError, getPoolData } = this.props;
    if (!ssjs.isAddress(bidAddress)) return setError('Invalid bid address');
    return getPoolData(bidAddress).then(bidData => {
      return this.setState({ bidData }, this.estimateAmount);
    }).catch(er => {
      return setError(er);
    });
  }

  onSourceData = (srcData) => {
    return this.setState({ srcData });
  }

  onAskAddress = (askAddress) => {
    const { setError, getPoolData } = this.props;
    if (!ssjs.isAddress(askAddress)) return setError('Invalid ask address');
    return getPoolData(askAddress).then(askData => {
      return this.setState({ askData }, this.estimateAmount);
    }).catch(er => {
      return setError(er);
    });
  }

  onDestinationData = (dstData) => {
    return this.setState({ dstData });
  }

  onAutogenDestinationAddress = (tokenAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!tokenAddress || !secretKey) return reject('Invalid input');
      const { dstData: { address: dstAddress } } = this.state;
      if (dstAddress) return resolve(dstAddress);

      let newAddress = null;
      const { wallet: { user }, updateWallet } = this.props;
      return sol.newSRC20Account(tokenAddress, secretKey).then(({ account, txId }) => {
        newAddress = account.publicKey.toBase58();
        const tokens = [...user.tokens];
        if (!tokens.includes(tokenAddress)) tokens.push(tokenAddress);
        return updateWallet({ ...user, tokens });
      }).then(re => {
        return resolve(newAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  onSwap = () => {
    const { setError, unlockWallet } = this.props;
    const {
      bidAmount, srcData: { address: srcAddress },
      bidData: {
        initialized: bidInitialized,
        address: bidAddress,
        token: bidToken,
        treasury: bidTreasury
      },
      askData: {
        initialized: askInitialized,
        address: askAddress,
        token: askToken,
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
        return this.onAutogenDestinationAddress(askToken.address, secretKey);
      }).then(dstAddress => {
        const amount = global.BigInt(bidAmount) * global.BigInt(10 ** bidToken.decimals);
        const payer = ssjs.fromSecretKey(secretKey);

        return this.swap.swap(
          amount,
          bidAddress,
          bidTreasury.address,
          srcAddress,
          bidToken.address,
          askAddress,
          askTreasury.address,
          dstAddress,
          askToken.address,
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
      bidAmount, askAmount,
      srcData: {
        initialized: srcInitialized,
        amount: srcAmount,
        token: srcToken
      },
      bidData: {
        initialized: bidInitialized,
        address: bidAddress,
        reserve: bidReserve,
        lpt: bidLPT,
      },
      askData: {
        initialized: askInitialized,
        address: askAddress,
        reserve: askReserve,
        lpt: askLPT, },
      txId, loading, advance, anchorEl
    } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} md={6}>
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
                  <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                    <Grid item className={classes.stretch}>
                      <Typography variant="h6">From</Typography>
                    </Grid>
                    <Grid item>
                      <Typography className={classes.price}>Price: ${utils.prettyNumber(utils.div(bidLPT, bidReserve))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <TokenSelection onChange={this.onBidAddress} />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Bid Amount"
                    variant="outlined"
                    helperText={`Balance: ${srcInitialized ? utils.prettyNumber(utils.div(srcAmount, global.BigInt(10 ** srcToken.decimals))) : 0}`}
                    value={bidAmount}
                    onChange={this.onBidAmount}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Collapse in={advance}>
                    <AccountSelection
                      label="Source Address"
                      poolAddress={bidAddress}
                      onChange={this.onSourceData}
                    />
                  </Collapse>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} className={classes.noWrap} alignItems="center">
                    <Grid item className={classes.stretch}>
                      <Typography variant="h6">To</Typography>
                    </Grid>
                    <Grid item>
                      <Typography className={classes.price}>Price: ${utils.prettyNumber(utils.div(askLPT, askReserve))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <TokenSelection onChange={this.onAskAddress} />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Ask Amount"
                    variant="outlined"
                    value={askAmount}
                    disabled={!askAmount}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Collapse in={advance}>
                    <AccountSelection
                      poolAddress={askAddress}
                      label="Destination Address"
                      onChange={this.onDestinationData}
                    />
                  </Collapse>
                </Grid>
                {bidInitialized && askInitialized ? <Grid item xs={6}>
                  <Typography variant="h5" align="center">0.25%</Typography>
                  <Typography variant="body2" align="center">Fee</Typography>
                </Grid> : null}
                {bidInitialized && askInitialized ? <Grid item xs={6}>
                  <Typography variant="h5" align="center">{utils.prettyNumber(utils.div(bidLPT, bidReserve) / utils.div(askLPT, askReserve))}</Typography>
                  <Typography variant="body2" align="center">Rate</Typography>
                </Grid> : null}
                {txId ? <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2">Done! Click the button to view the transaction.</Typography>
                    </Grid>
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
                        <Typography>Skip</Typography>
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
  updateWallet, unlockWallet,
  getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));