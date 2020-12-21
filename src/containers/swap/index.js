import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard, NotiCard } from 'components/cards';
import Bid from './bid';
import Ask from './ask';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';


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
      bidData: { initialized: bidInitialized, pool: bidPool },
      askData: { initialized: askInitialized, pool: askPool }
    } = this.state;
    if (!bidAmount || !bidInitialized || !askInitialized) return this.setState({ askAmount: 0 });
    const { reserve: bidReserve, token: bidToken } = bidPool;
    const { reserve: askReserve, token: askToken } = askPool;
    const amount = global.BigInt(bidAmount) * global.BigInt(10 ** bidToken.decimals);
    const newBidReserve = bidReserve + amount;
    const newAskReserve = bidReserve * askReserve / newBidReserve;
    const paidAmount = askReserve - newAskReserve;
    const askAmount = utils.div(paidAmount, global.BigInt(10 ** askToken.decimals));
    return this.setState({ askAmount });
  }

  onAmount = (e) => {
    const bidAmount = e.target.value || '';
    return this.setState({ bidAmount }, this.estimateAmount);
  }

  onBidAddress = (address) => {
    return this.setState({ bidAddress: address }, () => {
      const { bidAddress } = this.state;
      if (!sol.isAddress(bidAddress)) return;
      return sol.getPoolData(bidAddress).then(re => {
        return this.setState({ bidData: re }, this.estimateAmount);
      }).catch(er => {
        console.log(er);
        return this.setState({ askAmount: 0 });
      });
    });
  }

  onSourceAddress = (e) => {
    const srcAddress = e.target.value || '';
    return this.setState({ srcAddress });
  }

  onAskAddress = (address) => {
    return this.setState({ askAddress: address }, () => {
      const { askAddress } = this.state;
      if (!sol.isAddress(askAddress)) return;
      return sol.getPoolData(askAddress).then(re => {
        return this.setState({ askData: re }, this.estimateAmount);
      }).catch(er => {
        console.log(er);
        return this.setState({ askAmount: 0 });
      });
    });
  }

  onDestinationAddress = (e) => {
    const dstAddress = e.target.value || '';
    return this.setState({ dstAddress });
  }

  onSwap = () => {
    const {
      bidAmount, srcAddress, dstAddress,
      bidData: { initialized: bidInitialized, pool: bidPool },
      askData: { initialized: askInitialized, pool: askPool }
    } = this.state;
    const { wallet: { secretKey } } = this.props;
    if (!bidAmount || !srcAddress || !dstAddress || !bidInitialized || !askInitialized)
      return console.error('Invalid input');
    const { address: bidPoolAddress, token: bidToken, treasury: bidTreasury } = bidPool;
    const { address: askPoolAddress, token: askToken, treasury: askTreasury } = askPool;
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
    ).then(re => {
      console.log(re);
    }).catch(er => {
      return console.error(er);
    })
  }

  render() {
    const { srcAddress, dstAddress, bidAmount, askAmount } = this.state;
    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} md={6}>
            <NotiCard
              title="Notification"
              description="Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
              source="#"
            />
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">From</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Bid onChange={this.onBidAddress} />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    label="Source Address"
                    variant="outlined"
                    value={srcAddress}
                    onChange={this.onSourceAddress}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Bid Amount"
                    variant="outlined"
                    value={bidAmount}
                    onChange={this.onAmount}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">To</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Ask onChange={this.onAskAddress} />
                </Grid>
                <Grid item xs={8}>
                  <TextField
                    label="Destination Address"
                    variant="outlined"
                    value={dstAddress}
                    onChange={this.onDestinationAddress}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Ask Amount"
                    variant="outlined"
                    value={askAmount}
                    disabled={!askAmount}
                    fullWidth
                  />
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
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));