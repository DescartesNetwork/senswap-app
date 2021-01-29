import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

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
import AccountSelection from './accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import configs from 'configs';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';

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
      dstAddress: '',
      bidAmount: 0,
      askAmount: 0,
      bidAddress: '',
      askAddress: '',
      bidData: {},
      askData: {},
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

  onBidAddress = (address) => {
    return this.setState({ bidAddress: address }, () => {
      const { bidAddress } = this.state;
      if (!sol.isAddress(bidAddress)) return;
      return sol.getPurePoolData(bidAddress).then(bidData => {
        return this.setState({ bidData }, this.estimateAmount);
      }).catch(er => {
        return console.log(er);
      });
    });
  }

  onSourceAddress = (srcAddress) => {
    return this.setState({ srcAddress });
  }

  onAskAddress = (address) => {
    return this.setState({ askAddress: address }, () => {
      const { askAddress } = this.state;
      if (!sol.isAddress(askAddress)) return;
      return sol.getPurePoolData(askAddress).then(askData => {
        return this.setState({ askData }, this.estimateAmount);
      }).catch(er => {
        return console.log(er);
      });
    });
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

  onSwap = () => {
    const {
      bidAmount, srcAddress,
      bidData: { initialized: bidInitialized, address: bidPoolAddress, token: bidToken, treasury: bidTreasury },
      askData: { initialized: askInitialized, address: askPoolAddress, token: askToken, treasury: askTreasury }
    } = this.state;
    const { getSecretKey } = this.props;
    if (!bidAmount || !srcAddress || !bidInitialized || !askInitialized) return console.error('Invalid input');
    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return getSecretKey().then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(askToken.address, secretKey);
      }).then(dstAddress => {
        const amount = global.BigInt(bidAmount) * global.BigInt(10 ** bidToken.decimals);
        const payer = sol.fromSecretKey(secretKey);
        const bidPoolPublicKey = sol.fromAddress(bidPoolAddress);
        const bidTreasuryPublicKey = sol.fromAddress(bidTreasury.address);
        const srcTokenPublickKey = sol.fromAddress(srcAddress);
        const bidTokenPublickKey = sol.fromAddress(bidToken.address);
        const askPoolPublicKey = sol.fromAddress(askPoolAddress);
        const askTreasuryPublickKey = sol.fromAddress(askTreasury.address);
        const dstTokenPublickKey = sol.fromAddress(dstAddress);
        const askTokenPublicKey = sol.fromAddress(askToken.address);

        return sol.swap(
          amount,
          payer,
          bidPoolPublicKey,
          bidTreasuryPublicKey,
          srcTokenPublickKey,
          bidTokenPublickKey,
          askPoolPublicKey,
          askTreasuryPublickKey,
          dstTokenPublickKey,
          askTokenPublicKey,
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
      bidAmount, askAmount, bidAddress, askAddress,
      bidData: {
        initialized: bidInitialized,
        reserve: bidReserve,
        lpt: bidLPT,
      },
      askData: {
        initialized: askInitialized,
        reserve: askReserve,
        lpt: askLPT, },
      txId, loading, advance, anchorEl } = this.state;

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
                      onChange={this.onSourceAddress}
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
                      onChange={this.onDestinationAddress}
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
  updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));