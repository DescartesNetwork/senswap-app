import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';
import Brand from 'senswap-ui/brand';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';

import Header from './header';
import Introduction from './introduction';
import From from './from';
import To from './to';
import Details from './details';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import oracle from 'helpers/oracle';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';
import { openWallet, updateWallet } from 'modules/wallet.reducer';

import SwapIntroductionImage from 'static/images/swap-introduction.png';


class Swap extends Component {
  constructor() {
    super();

    this.state = {
      txId: '',
      bidAccountData: {},
      bidValue: '',
      askAccountData: {},
      askValue: '',
      slippage: 0.01,
      hopData: [],
    }

    this.swap = window.senswap.swap;
  }

  _routing = async (srcPoolAddresses, dstPoolAddresses) => {
    const { getPoolData } = this.props;

    let maxSrcPoolData = { reserve_s: global.BigInt(0) }
    let maxDstPoolData = { reserve_s: global.BigInt(0) }

    for (let srcPoolAddress of srcPoolAddresses) {
      const srcPoolData = await getPoolData(srcPoolAddress);
      const { state: srcState, reserve_s: srcReserve } = srcPoolData || {}
      if (srcState !== 1 || srcReserve <= 0) continue;
      const { reserve_s: maxSrcReserve } = maxSrcPoolData || {}
      if (maxSrcReserve < srcReserve) maxSrcPoolData = srcPoolData;

      for (let dstPoolAddress of dstPoolAddresses) {
        const dstPoolData = await getPoolData(dstPoolAddress);
        const { state: dstState, reserve_s: dstReserve } = dstPoolData || {}
        if (dstState !== 1 || dstReserve <= 0) continue;
        const { reserve_s: maxDstReserve } = maxDstPoolData || {}
        if (maxDstReserve < dstReserve) maxDstPoolData = dstPoolData;

        if (srcPoolAddress === dstPoolAddress) return [srcPoolAddress, dstPoolAddress];
      }
    }

    const { address: srcPoolAddress } = maxSrcPoolData;
    const { address: dstPoolAddress } = maxDstPoolData;
    return [srcPoolAddress, dstPoolAddress];
  }

  routing = async (srcMintAddress, dstMintAddress) => {
    if (!ssjs.isAddress(srcMintAddress)) throw new Error('Invalid source mint address');
    if (!ssjs.isAddress(dstMintAddress)) throw new Error('Invalid destination mint address');
    if (srcMintAddress === dstMintAddress) throw new Error('The pools is identical');

    const { getPool, getPools, getPoolData } = this.props;
    const srcCondition = { '$or': [{ mintS: srcMintAddress }, { mintA: srcMintAddress }, { mintB: srcMintAddress }] }
    const dstCondition = { '$or': [{ mintS: dstMintAddress }, { mintA: dstMintAddress }, { mintB: dstMintAddress }] }

    const srcData = await getPools(srcCondition, -1, 0);
    if (!srcData.length) throw new Error('Cannot find available pools');
    const srcPoolAddresses = srcData.map(({ address }) => address);

    const dstData = await getPools(dstCondition, -1, 0);
    if (!dstData.length) throw new Error('Cannot find available pools');
    const dstPoolAddresses = dstData.map(({ address }) => address);

    const route = await this._routing(srcPoolAddresses, dstPoolAddresses);
    let data = await Promise.all(route.map(address => getPool(address)));
    if (data.length < 2) throw new Error('Cannot find available pools');
    data = await Promise.all(data.map(({ address }) => getPoolData(address)));
    if (data.length < 2) throw new Error('Cannot find available pools');

    return data;
  }

  estimateState = async (inverse = false) => {
    const { setError } = this.props;
    const { bidAccountData, askAccountData, bidValue, askValue } = this.state;
    const { mint: bidMintData } = bidAccountData || {}
    const { mint: askMintData } = askAccountData || {}
    const { address: srcMintAddress, decimals: bidDecimals } = bidMintData || {}
    const { address: dstMintAddress, decimals: askDecimals } = askMintData || {}
    if (!ssjs.isAddress(srcMintAddress) || !ssjs.isAddress(dstMintAddress)) return;

    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      this.setState({ loading: true });
      try {
        const [bidPoolData, askPoolData] = await this.routing(srcMintAddress, dstMintAddress);

        let data = [];
        if (inverse) data = await oracle.inverseCurve(
          ssjs.decimalize(askValue, askDecimals),
          srcMintAddress, bidPoolData, dstMintAddress, askPoolData);
        else data = await oracle.curve(
          ssjs.decimalize(bidValue, bidDecimals),
          srcMintAddress, bidPoolData, dstMintAddress, askPoolData);

        let bidAmount = null;
        let askAmount = null;
        if (data.length === 1) [{ askAmount, bidAmount }] = data;
        else if (data.length === 2) [{ bidAmount }, { askAmount }] = data;
        else throw new Error('Cannot find available pools');

        let state = { loading: false, hopData: data }
        if (inverse) state.bidValue = ssjs.undecimalize(bidAmount, bidDecimals);
        else state.askValue = ssjs.undecimalize(askAmount, askDecimals);
        return this.setState({ ...state });
      } catch (er) {
        await setError(er);
        return this.setState({ loading: false });
      }
    }, 500);
  }

  estimateLimit = (askAmount) => {
    const { slippage } = this.state;
    if (slippage < 0) return global.BigInt(0);
    const maxSlippage = ssjs.decimalize(slippage, 9);
    const decimals = ssjs.decimalize(1, 9);
    const limit = askAmount + askAmount * maxSlippage / decimals;
    return limit;
  }

  onBidData = ({ accountData, value }) => {
    return this.setState({
      bidAccountData: accountData, bidValue: value, askValue: ''
    }, () => this.estimateState(false));
  }

  onAskData = ({ accountData, value }) => {
    return this.setState({
      askAccountData: accountData, bidValue: '', askValue: value
    }, () => this.estimateState(true));
  }

  onSlippage = (slippage) => {
    return this.setState({ slippage });
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

  executeSwap = () => {
    const { setError, setSuccess } = this.props;
    const { bidAccountData, hopData } = this.state;
    let { address: srcAddress } = bidAccountData;
    return this.setState({ loading: true }, () => {
      return hopData.each(data => {
        const { dstMintAddress } = data || {}
        return this.onAutogenDestinationAddress(dstMintAddress);
      }).then(dstAddresses => {
        const data = hopData.zip(dstAddresses);
        return data.each(data => {
          const [{ bidAmount, askAmount, poolData: { address: poolAddress } }, dstAddress] = data;
          const _srcAddress = srcAddress;
          srcAddress = dstAddress;
          const limit = this.estimateLimit(askAmount);
          console.log(askAmount, limit)
          return this.swap.swap(
            bidAmount,
            limit,
            poolAddress,
            _srcAddress,
            dstAddress,
            window.senswap.wallet
          );
        });
      }).then(txIds => {
        return this.setState({ loading: false }, () => {
          return setSuccess('Swap successfully', utils.explorer(txIds[txIds.length - 1]));
        });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  renderAction = () => {
    const { wallet: { user: { address } }, openWallet } = this.props;
    const { loading } = this.state;
    if (!ssjs.isAddress(address)) return <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={openWallet}
      fullWidth
    >
      <Typography>Connect Wallet</Typography>
    </Button>
    return <Button
      variant="contained"
      color="primary"
      size="large"
      disabled={loading}
      startIcon={loading ? <CircularProgress size={17} /> : null}
      onClick={this.executeSwap}
      fullWidth
    >
      <Typography>Swap</Typography>
    </Button>
  }

  render() {
    const { classes, ui: { width } } = this.props;
    const { bidValue, askValue, slippage, hopData } = this.state;

    return <Grid container>
      <BucketWatcher
        addresses={hopData.map(({ poolData: { address } }) => address)}
        onChange={() => this.estimateState()}
      />
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain />
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item xs={12} md={4}>
              <div
                className={width < 960 ? classes.imageColumn : classes.imageRow}
                style={{
                  background: `url("${SwapIntroductionImage}")`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                }}
              >
                <Grid container>
                  <Grid item xs={12} >
                    <Brand />
                  </Grid>
                  <Grid item xs={12}>
                    <Drain size={8} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h2">Let's Swap</Typography>
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container justify="center">
                <Grid item xs={11}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Drain />
                    </Grid>
                    <Grid item xs={12}>
                      <From onChange={this.onBidData} value={bidValue} />
                    </Grid>
                    <Grid item xs={12}>
                      <To
                        onSlippage={this.onSlippage} slippage={slippage}
                        onChange={this.onAskData} value={askValue}
                      />
                    </Grid>
                    <Grid item xs={12} >
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Details hopData={hopData} />
                    </Grid>
                    <Grid item xs={12}>
                      <Drain size={1} />
                    </Grid>
                    <Grid item xs={12}>
                      {this.renderAction()}
                    </Grid>
                    <Grid item xs={12} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Introduction />
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
  setError, setSuccess,
  updateWallet, openWallet,
  getPools, getPool,
  getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));