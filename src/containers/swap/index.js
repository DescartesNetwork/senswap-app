import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';

import { SwapCallsRounded } from 'senswap-ui/icons';

import Header from './header';
import Introduction from './introduction';
import From from './from';
import To from './to';
import Details from './details';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import oracle from 'helpers/oracle';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData, getAccountData, getMintData } from 'modules/bucket.reducer';
import { openWallet, updateWallet } from 'modules/wallet.reducer';


class Swap extends Component {
  constructor() {
    super();

    this.state = {

      bidPoolData: {},
      bidAccountData: {},
      bidValue: '',

      askPoolData: {},
      askAccountData: {},
      askValue: '',

      slippage: 0.01,
      hopData: [],
      txIds: [],

    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    this.parseParams();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: prevParams }, wallet: { user: prevUser } } = prevProps;
    const { match: { params }, wallet: { user } } = this.props;
    if (!isEqual(prevParams, params)) this.parseParams();
    if (!isEqual(prevUser, user)) this.parseParams();
  }

  parseParams = async () => {
    const { match: { params: { poolAddress } }, setError, getPoolData } = this.props;
    if (!ssjs.isAddress(poolAddress)) return;
    try {
      const data = await getPoolData(poolAddress);
      const { address, mint_a, mint_b } = data || {};
      if (!ssjs.isAddress(address)) return setError('Cannot load pool data');
      const { address: mintAddressA } = mint_a || {};
      const { address: mintAddressB } = mint_b || {};
      if (!ssjs.isAddress(mintAddressA)) return setError('Cannot load token data');
      if (!ssjs.isAddress(mintAddressB)) return setError('Cannot load token data');
      const bidAccountData = await this.fetchAccountData(mintAddressA);
      const askAccountData = await this.fetchAccountData(mintAddressB);
      return this.setState({
        bidPoolData: data, bidAccountData,
        askPoolData: data, askAccountData
      });
    } catch (er) {
      return setError(er);
    }
  }

  fetchAccountData = async (mintAddress) => {
    const {
      wallet: { user: { address: walletAddress } },
      setError, getAccountData, getMintData
    } = this.props;
    if (!ssjs.isAddress(mintAddress) || !ssjs.isAddress(walletAddress)) return {}
    try {
      const { address, state } = await sol.scanAccount(mintAddress, walletAddress);
      if (!ssjs.isAddress(address) || !state) {
        const mintData = await getMintData(mintAddress);
        return { address: '', mint: mintData }
      }
      const accountData = await getAccountData(address);
      return accountData;
    } catch (er) {
      await setError(er);
      return {}
    }
  }

  estimateTheBestPool = async (srcPoolAddresses, dstPoolAddresses) => {
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

    const route = await this.estimateTheBestPool(srcPoolAddresses, dstPoolAddresses);
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
    const limit = askAmount - askAmount * maxSlippage / decimals;
    return limit;
  }

  onBidData = ({ accountData, poolData, value }) => {
    return this.setState({
      bidAccountData: accountData,
      bidValue: value,
      bidPoolData: poolData,
      askValue: '',
      txIds: [],
    }, () => this.estimateState(false));
  }

  onAskData = ({ accountData, poolData, value }) => {
    return this.setState({
      bidValue: '',
      askAccountData: accountData,
      askValue: value,
      askPoolData: poolData,
      txIds: [],
    }, () => this.estimateState(true));
  }

  onSlippage = (slippage) => {
    return this.setState({ slippage });
  }

  onSwitch = () => {
    const { bidAccountData, bidPoolData, askAccountData, askPoolData } = this.state;
    return this.setState({
      bidValue: '',
      bidAccountData: askAccountData,
      bidPoolData: askPoolData,
      askValue: '',
      askAccountData: bidAccountData,
      askPoolData: bidPoolData,
    }, () => this.estimateState(false));
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

  executeSwap = async () => {
    const { setError } = this.props;
    const { bidAccountData, hopData } = this.state;
    let { address: srcAddress } = bidAccountData;

    this.setState({ loading: true });
    let txIds = [];
    try {
      for (let data of hopData) {
        const { bidAmount, askAmount, poolData: { address: poolAddress }, dstMintAddress } = data;
        const dstAddress = await this.onAutogenDestinationAddress(dstMintAddress);;
        const _srcAddress = srcAddress;
        srcAddress = dstAddress;
        const limit = this.estimateLimit(askAmount);
        const txId = await this.swap.swap(
          bidAmount,
          limit,
          poolAddress,
          _srcAddress,
          dstAddress,
          window.senswap.wallet
        );
        txIds.push(txId);
        this.setState({ txIds });
      }
    } catch (er) {
      txIds.push('error');
      await setError(er);
    }
    return this.setState({ loading: false, txIds });
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
    const { classes, ui: { type } } = this.props;
    const {
      bidPoolData, bidAccountData, bidValue,
      askPoolData, askAccountData, askValue,
      txIds, slippage, hopData,
    } = this.state;

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
        <Paper className={classes.paper} style={{
          paddingLeft: type !== 'xs' ? 32 : 16,
          paddingRight: type !== 'xs' ? 32 : 16,
        }}>
          <Grid container justify="center">
            <Grid item xs={11}>
              <Grid container>
                <Grid item xs={12}>
                  <From
                    accountData={bidAccountData}
                    poolData={bidPoolData}
                    onChange={this.onBidData} value={bidValue}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container justify="center">
                    <Grid item>
                      <IconButton size="small" onClick={this.onSwitch}>
                        <SwapCallsRounded />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <To
                    accountData={askAccountData}
                    poolData={askPoolData}
                    onSlippage={this.onSlippage} slippage={slippage}
                    onChange={this.onAskData} value={askValue}
                  />
                </Grid>
                <Grid item xs={12} >
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Details hopData={hopData} txIds={txIds} />
                </Grid>
                <Grid item xs={12}>
                  <Drain size={1} />
                </Grid>
                <Grid item xs={12}>
                  {this.renderAction()}
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
  getPoolData, getAccountData, getMintData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));