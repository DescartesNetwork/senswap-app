import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import CircularProgress from 'senswap-ui/circularProgress';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';

import AddLiquidity from 'containers/pool/addLiquidity';
import RemoveLiquidity from 'containers/pool/removeLiquidity';
import { CardPool } from 'components/card';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { openWallet } from 'modules/wallet.reducer';
import { getPools } from 'modules/pool.reducer';
import { getPoolData, getAccountData } from 'modules/bucket.reducer';


class NewPools extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visibleDeposit: false,
      visibleWithdraw: false,
      poolData: {},
      accountData: {},
      data: [],
      page: 0,
      limit: 6,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.setState({ data: [] }, this.fetchData);
  }

  getPoolDataAndAccountData = async (poolAddress) => {
    const {
      setError, getPoolData, getAccountData,
      wallet: { user: { address: walletAddress } }
    } = this.props;
    try {
      let poolData = await getPoolData(poolAddress);
      const {
        reserve_a: reserveA, mint_a: { ticket: ticketA, decimals: decimalsA },
        reserve_b: reserveB, mint_b: { ticket: ticketB, decimals: decimalsB },
        reserve_s: reserveS, mint_s: { ticket: ticketS, decimals: decimalsS }
      } = poolData;
      const syntheticData = [
        [ssjs.undecimalize(reserveA, decimalsA), ticketA],
        [ssjs.undecimalize(reserveB, decimalsB), ticketB],
        [ssjs.undecimalize(reserveS, decimalsS), ticketS]
      ];
      const data = await Promise.all(syntheticData.map(([balance, ticket]) => utils.fetchValue(balance, ticket)));
      const usd = data.map(({ usd }) => usd).reduce((a, b) => a + b, 0);
      poolData.usd = usd;
      const { mint_lpt: { address: mintAddress } } = poolData;
      if (!ssjs.isAddress(walletAddress)) return poolData;
      const { address: accountAddress, state } = await sol.scanAccount(mintAddress, walletAddress);
      if (!state) return poolData;
      const accountData = await getAccountData(accountAddress);
      poolData.accountData = accountData;
      return poolData;
    } catch (er) {
      await setError(er);
      return {}
    }
  }

  fetchData = async () => {
    const { setError, getPools } = this.props;
    const { data, page, limit } = this.state;
    try {
      this.setState({ loading: true });
      const poolAddresses = await getPools({}, limit, page);
      const re = await Promise.all(poolAddresses.map(({ address }) => this.getPoolDataAndAccountData(address)));
      const expandedData = data.concat(re);
      return this.setState({ data: expandedData, loading: false });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onMore = () => {
    const { page } = this.state;
    return this.setState({ page: page + 1 }, this.fetchData);
  }

  onOpenDeposit = (i) => {
    const { data } = this.state;
    const poolData = { ...data[i] }
    return this.setState({ poolData, visibleDeposit: true });
  }
  onCloseDeposit = () => {
    return this.setState({ poolData: {}, visibleDeposit: false });
  }

  onOpenWithdraw = (i) => {
    const { data } = this.state;
    const { accountData } = { ...data[i] }
    return this.setState({ accountData, visibleWithdraw: true });
  }
  onCloseWithdraw = () => {
    return this.setState({ accountData: {}, visibleWithdraw: false });
  }

  render() {
    const { wallet: { user: { address: walletAddress } }, openWallet } = this.props;
    const {
      loading, visibleDeposit, visibleWithdraw,
      accountData, poolData, data,
    } = this.state;

    const isLoggedIn = ssjs.isAddress(walletAddress);

    return <Grid container spacing={2}>
      {data.map((poolData, i) => {
        const {
          address: poolAddress, state, accountData,
          mint_s: { icon: iconS, symbol: symbolS, decimals },
          mint_a: { icon: iconA, symbol: symbolA },
          mint_b: { icon: iconB, symbol: symbolB },
        } = poolData;
        if (!ssjs.isAddress(poolAddress) || state !== 1) return null;
        const { address: accountAddress, amount } = accountData || {}
        const isLP = ssjs.isAddress(accountAddress);
        const icons = [iconA, iconB, iconS];
        const symbols = [symbolA, symbolB, symbolS];
        return <Grid item key={i} xs={12} md={6} lg={4}>
          <CardPool
            icons={icons}
            symbols={symbols}
            volume={poolData.usd}
            stake={utils.prettyNumber(ssjs.undecimalize(amount, decimals))}
            {...(!isLoggedIn ? { onConnect: openWallet } : null)}
            {...(isLP ? { onWithdraw: () => this.onOpenWithdraw(i) } : null)}
            onDeposit={() => this.onOpenDeposit(i)}
          />
        </Grid>
      })}
      <AddLiquidity poolData={poolData} visible={visibleDeposit} onClose={this.onCloseDeposit} />
      <RemoveLiquidity data={accountData} visible={visibleWithdraw} onClose={this.onCloseWithdraw} />
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <Button onClick={this.onMore} disabled={loading} startIcon={loading ? <CircularProgress size={17} /> : null}>
            <Typography>See more</Typography>
          </Button>
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
  setError,
  openWallet,
  getPools,
  getPoolData, getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPools)));