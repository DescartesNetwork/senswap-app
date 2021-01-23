import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Drain from 'components/drain';
import { BaseCard, NotiCard } from 'components/cards';
import TokenSelection from './tokenSelection';
import AccountSelection from './accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { getSecretKey } from 'modules/wallet.reducer';


class Swap extends Component {
  constructor() {
    super();

    this.state = {
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

  onAmount = (e) => {
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
        console.log(er);
        return this.setState({ askAmount: 0 });
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
        console.log(er);
        return this.setState({ askAmount: 0 });
      });
    });
  }

  onDestinationAddress = (dstAddress) => {
    return this.setState({ dstAddress });
  }

  onSwap = () => {
    const {
      bidAmount, srcAddress, dstAddress,
      bidData: { initialized: bidInitialized, address: bidPoolAddress, token: bidToken, treasury: bidTreasury },
      askData: { initialized: askInitialized, address: askPoolAddress, token: askToken, treasury: askTreasury }
    } = this.state;
    const { getSecretKey } = this.props;
    if (!bidAmount || !srcAddress || !dstAddress || !bidInitialized || !askInitialized)
      return console.error('Invalid input');
    return getSecretKey().then(secretKey => {
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
    }).then(re => {
      console.log(re);
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { bidAmount, askAmount } = this.state;
    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">From</Typography>
                </Grid>
                <Grid item xs={6}>
                  <TokenSelection onChange={this.onBidAddress} />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Bid Amount"
                    variant="outlined"
                    value={bidAmount}
                    onChange={this.onAmount}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <AccountSelection label="Source Address" onChange={this.onSourceAddress} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">To</Typography>
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
                  <AccountSelection label="Destination Address" onChange={this.onDestinationAddress} />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={this.onSwap}
                    fullWidth
                  >
                    <Typography variant="body2">Swap</Typography>
                  </Button>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));