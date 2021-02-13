import React, { Component } from 'react';
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
import Bid from './bid';
import Ask from './ask';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';
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

      srcAddress: '',
      bidAmount: 0,
      bidAddress: '',
      bidData: {},

      dstAddress: '',
      askAmount: 0,
      askAddress: '',
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
    }, this.estimateAmount);
  }

  onAutogenDestinationAddress = (tokenAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      const { dstAddress } = this.state;
      const { wallet: { user, accounts }, updateWallet, syncWallet } = this.props;
      if (!ssjs.isAddress(tokenAddress) || !secretKey) return reject('Invalid input');
      if (ssjs.isAddress(dstAddress)) return resolve(dstAddress);

      let accountAddress = null;
      return sol.newAccount(tokenAddress, secretKey).then(({ account }) => {
        accountAddress = account.publicKey.toBase58();
        const newTokens = [...user.tokens];
        if (!newTokens.includes(tokenAddress)) newTokens.push(tokenAddress);
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ user: { ...user, tokens: newTokens }, accounts: newAccounts });
      }).then(re => {
        return syncWallet();
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
      bidData: {
        initialized: bidInitialized,
        reserve: bidReserve,
        lpt: bidLPT,
      },
      askAmount,
      askData: {
        initialized: askInitialized,
        reserve: askReserve,
        lpt: askLPT
      },
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
                  <Bid advance={advance} onChange={this.onBid} />
                </Grid>
                <Grid item xs={12}>
                  <Ask advance={advance} amount={askAmount} onChange={this.onAsk} />
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
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet, syncWallet,
  getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));