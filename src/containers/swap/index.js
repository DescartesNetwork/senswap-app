import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { PublicRounded, ArrowForwardRounded, SwapHorizRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';
import Bid from './bid';
import Ask from './ask';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import oracle from 'helpers/oracle';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,

      srcAddress: '',
      bidAmount: 0,
      bidAddress: '',
      bidData: {},

      dstAddress: '',
      askAmount: 0,
      askAddress: '',
      askData: {},

      fee: global.BigInt(3000000),
      ratio: 0,
    }

    this.swap = window.senwallet.swap;
  }

  onClear = () => {
    return this.setState({ txId: '' });
  }

  onBid = ({ amount: bidAmount, poolData: bidData, accountAddress: srcAddress }) => {
    return this.setState({ bidAmount, bidData, srcAddress }, () => {
      const { setError, getPoolData } = this.props;
      const { bidAmount, bidData, askData } = this.state;
      if (!bidAmount || bidData.state !== 1 || askData.state !== 1) return this.setState({ slippage: 0, ratio: 0, askAmount: 0 });
      return oracle.curve(bidAmount, bidData, askData, getPoolData).then(data => {
        const [{ slippage, ratio, amount: askAmount, fee }] = data;
        return this.setState({ slippage, ratio, askAmount, fee });
      }).catch(er => {
        return setError(er);
      });
    });
  }

  onAsk = ({ amount: askAmount, poolData: askData, accountAddress: dstAddress }) => {
    return this.setState({ askAmount, askData, dstAddress }, () => {
      const { setError, getPoolData } = this.props;
      const { askAmount, bidData, askData } = this.state;
      if (!askAmount || bidData.state !== 1 || askData.state !== 1) return this.setState({ slippage: 0, ratio: 0, bidAmount: 0 });
      return oracle.inverseCurve(askAmount, bidData, askData, getPoolData).then(data => {
        const [{ slippage, ratio, amount: bidAmount, fee }] = data;
        return this.setState({ slippage, ratio, bidAmount, fee });
      }).catch(er => {
        return setError(er);
      });
    });
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
    const { setError, unlockWallet, getPools, getPool, getPoolData } = this.props;
    const {
      bidAmount, srcAddress,
      bidData: {
        state: bidState,
        address: bidPoolAddress,
        treasury: bidTreasury,
        network: {
          address: networkAddress,
          primary: { address: senAddress },
          vault: { address: vaultAddress }
        },
      },
      askData: {
        state: askState,
        address: askPoolAddress,
        mint: askMint,
        treasury: askTreasury
      }
    } = this.state;

    if (bidState !== 1 || askState !== 1) return setError('Please wait for data loaded');
    if (!bidAmount) return setError('Invalid bid amount');
    if (!ssjs.isAddress(srcAddress)) return setError('Invalid source address');

    let secretKey = null;
    let senPoolAddress = null;
    let senTreasuryAddress = null;
    return this.setState({ loading: true }, () => {
      return getPools({ mint: senAddress }).then(data => {
        return Promise.all(data.map(({ _id }) => getPool(_id)));
      }).then(([{ address }]) => {
        return getPoolData(address);
      }).then(({ address: poolAddress, treasury: { address: treasuryAddress } }) => {
        senPoolAddress = poolAddress;
        senTreasuryAddress = treasuryAddress;
        return unlockWallet();
      }).then(re => {
        secretKey = re;
        return this.onAutogenDestinationAddress(askMint.address, secretKey);
      }).then(dstAddress => {
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.swap(
          bidAmount,
          networkAddress,
          bidPoolAddress,
          bidTreasury.address,
          srcAddress,
          askPoolAddress,
          askTreasury.address,
          dstAddress,
          senPoolAddress,
          senTreasuryAddress,
          vaultAddress,
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
      bidAmount, bidData: { state: bidState, mint: bidMint },
      askAmount, askData: { state: askState, mint: askMint },
      slippage, ratio, fee, txId, loading
    } = this.state;
    const { decimals: bidDecimals, symbol: bidSymbol } = bidMint || {}
    const { decimals: askDecimals, symbol: askSymbol } = askMint || {}

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} lg={8}>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} sm={8} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">Swap</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
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
                      <Grid container justify="space-around" spacing={2}>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Fee</span> {ssjs.undecimalize(fee, 9) * 100}%</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>{askSymbol}/{bidSymbol}</span> {utils.prettyNumber(ratio)}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="h4" align="center"><span className={classes.subtitle}>Slippage</span> {utils.prettyNumber(slippage * 100)}%</Typography>
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
      </Grid>
    </Grid >
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
  getPools, getPool,
  updateWallet, unlockWallet, syncWallet,
  getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));