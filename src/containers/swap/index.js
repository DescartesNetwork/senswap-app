import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Drain from 'senswap-ui/drain';

import { PublicRounded, ArrowForwardRounded, SwapHorizRounded } from 'senswap-ui/icons';

import { BaseCard } from 'components/cards';
import Bid from './bid';
import Ask from './ask';
import SwapInfo from './info';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import oracle from 'helpers/oracle';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';


const EMPTY = {
  bidAmount: global.BigInt(0),
  askAmount: global.BigInt(0),
  loading: false,
  txId: '',
}

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,

      srcAddress: '',
      bidData: {},
      bidPrimaryData: {},
      dstAddress: '',
      askData: {},
      askPrimaryData: {},

      data: [],
    }

    this.swap = window.senswap.swap;
  }

  onClear = () => {
    return this.setState({ ...EMPTY, txId: '' });
  }

  onBid = ({
    amount: bidAmount,
    poolData: bidData,
    primaryPoolData: bidPrimaryData,
    accountAddress: srcAddress
  }) => {
    return this.setState({ bidAmount, bidData, bidPrimaryData, srcAddress }, () => {
      const { setError } = this.props;
      const { bidAmount, bidData, bidPrimaryData, askData, askPrimaryData } = this.state;
      if (bidData.state !== 1 || askData.state !== 1) return this.setState({ data: [] });
      return oracle.curve(bidAmount, bidData, askData, bidPrimaryData, askPrimaryData).then(data => {
        const { askAmount } = data[data.length - 1];
        return this.setState({ data, askAmount });
      }).catch(er => {
        return setError(er);
      });
    });
  }

  onAsk = ({
    amount: askAmount,
    poolData: askData,
    primaryPoolData: askPrimaryData,
    accountAddress: dstAddress
  }) => {
    return this.setState({ askAmount, askData, askPrimaryData, dstAddress }, () => {
      const { setError } = this.props;
      const { askAmount, bidData, bidPrimaryData, askData, askPrimaryData } = this.state;
      if (bidData.state !== 1 || askData.state !== 1) return this.setState({ data: [] });
      return oracle.inverseCurve(askAmount, bidData, askData, bidPrimaryData, askPrimaryData).then(data => {
        const { bidAmount } = data[0];
        return this.setState({ data, bidAmount });
      }).catch(er => {
        return setError(er);
      });
    });
  }

  onAutogenDestinationAddress = (mintAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      const { wallet: { user, accounts }, updateWallet, syncWallet } = this.props;
      if (!ssjs.isAddress(mintAddress) || !secretKey) return reject('Invalid input');

      let accountAddress = null;
      return sol.newAccount(mintAddress, secretKey).then(({ address }) => {
        accountAddress = address;
        const newMints = [...user.mints];
        if (newMints.includes(mintAddress)) return resolve(accountAddress);
        newMints.push(mintAddress);
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
    const { srcAddress, data } = this.state;

    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this._onSwap(srcAddress, data[0], secretKey);
      }).then(({ txId, dstAddress: nextSrcAddress }) => {
        if (data[1]) return this._onSwap(nextSrcAddress, data[1], secretKey);
        else return Promise.resolve({ txId });
      }).then(({ txId }) => {
        return this.setState({ loading: false, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  _onSwap = (srcAddress, data, secretKey) => {
    return new Promise((resolve, reject) => {
      const {
        bidAmount,
        bidData: {
          state: bidState,
          address: bidPoolAddress,
          treasury: { address: bidTreasuryAddress },
        },
        askData: {
          state: askState,
          address: askPoolAddress,
          mint: { address: askMintAddress },
          treasury: { address: askTreasuryAddress }
        },
        primaryData: {
          state: senState,
          address: senPoolAddress,
          treasury: { address: senTreasuryAddress },
          network: {
            address: networkAddress,
            vault: { address: vaultAddress }
          },
        }
      } = data;

      if (bidState === 0) return reject('Uninitialized bid pool');
      if (askState === 0) return reject('Uninitialized ask pool');
      if (senState === 0) return reject('Uninitialized sen pool');
      if (bidState === 2) return reject('Frozen bid pool');
      if (askState === 2) return reject('Frozen ask pool');
      if (senState === 2) return reject('Frozen sen pool');
      if (!bidAmount) return reject('Invalid bid amount');
      if (!ssjs.isAddress(srcAddress)) return reject('Invalid source address');

      let dstAddress = null;
      return this.onAutogenDestinationAddress(askMintAddress, secretKey).then(re => {
        dstAddress = re;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.swap(
          bidAmount,
          networkAddress,
          bidPoolAddress,
          bidTreasuryAddress,
          srcAddress,
          askPoolAddress,
          askTreasuryAddress,
          dstAddress,
          senPoolAddress,
          senTreasuryAddress,
          vaultAddress,
          payer
        );
      }).then(txId => {
        return resolve({ txId, dstAddress });
      }).catch(er => {
        return reject(er);
      });
    });
  }

  render() {
    const { classes } = this.props;
    const {
      bidAmount, bidData: { state: bidState, mint: bidMint },
      askAmount, askData: { state: askState, mint: askMint },
      data, txId, loading
    } = this.state;
    const { decimals: bidDecimals } = bidMint || {}
    const { decimals: askDecimals } = askMint || {}

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12} md={8} lg={6}>
        <BaseCard>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">Swap</Typography>
            </Grid>
            <Grid item xs={12}>
              <Drain size={2} />
            </Grid>
            <Grid item xs={12}>
              <Bid value={ssjs.undecimalize(bidAmount, bidDecimals)} onChange={this.onBid} />
            </Grid>
            <Grid item xs={12}>
              <Ask value={ssjs.undecimalize(askAmount, askDecimals)} onChange={this.onAsk} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} className={classes.action}>
                <Grid item xs={12}>
                  <SwapInfo data={data} />
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
                    disabled={loading || bidState !== 1 || askState !== 1}
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
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet, syncWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));