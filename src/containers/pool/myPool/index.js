import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import CircularProgress from 'senswap-ui/circularProgress';

import AddLiquidity from 'containers/pool/addLiquidity';
import RemoveLiquidity from 'containers/pool/removeLiquidity';
import { CardPool } from 'components/card';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class MyPool extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visibleDeposit: false,
      visibleWithdraw: false,
      poolData: {},
      accountData: {},
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.fetchData();
  }

  fetchData = async () => {
    const { wallet: { lpts }, getAccountData } = this.props;
    this.setState({ loading: true });
    let data = [];
    for (let lptAddress of lpts) {
      try {
        const accountData = await getAccountData(lptAddress);
        const { pool: poolData } = accountData || {}
        const { address: poolAddress } = poolData || {}
        if (!ssjs.isAddress(poolAddress)) continue;
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
        const re = await Promise.all(syntheticData.map(([balance, ticket]) => utils.fetchValue(balance, ticket)));
        const usd = re.map(({ usd }) => usd).reduce((a, b) => a + b, 0);
        accountData.pool.usd = usd;
        data.push(accountData);
        this.setState({ data: [...data] });
      } catch (er) {
        // Nothing
      }
    }
    return this.setState({ loading: false });
  }

  onOpenDeposit = (index) => {
    const { data } = this.state;
    const poolData = { ...data[index].pool }
    return this.setState({ poolData, visibleDeposit: true });
  }
  onCloseDeposit = () => {
    return this.setState({ poolData: {}, visibleDeposit: false });
  }

  onOpenWithdraw = (index) => {
    const { data } = this.state;
    const accountData = { ...data[index] }
    return this.setState({ accountData, visibleWithdraw: true });
  }
  onCloseWithdraw = () => {
    return this.setState({ accountData: {}, visibleWithdraw: false });
  }

  render() {
    const {
      loading, visibleDeposit, visibleWithdraw,
      poolData, accountData, data
    } = this.state;

    return <Grid container spacing={2}>
      {data.map((lptData, index) => {
        const {
          amount, mint: { decimals },
          pool: {
            address: poolAddress, usd,
            mint_s: { icon: iconS, symbol: symbolS },
            mint_a: { icon: iconA, symbol: symbolA },
            mint_b: { icon: iconB, symbol: symbolB },
          }
        } = lptData;
        const icons = [iconA, iconB, iconS];
        const symbols = [symbolA, symbolB, symbolS];
        return <Grid item key={index} xs={12} md={6} lg={4}>
          <CardPool
            address={poolAddress}
            stake={utils.prettyNumber(ssjs.undecimalize(amount, decimals))}
            icons={icons}
            symbols={symbols}
            volume={usd || 0}
            onDeposit={() => this.onOpenDeposit(index)}
            onWithdraw={() => this.onOpenWithdraw(index)}
          />
        </Grid>
      })}
      <AddLiquidity poolData={poolData} visible={visibleDeposit} onClose={this.onCloseDeposit} />
      <RemoveLiquidity data={accountData} visible={visibleWithdraw} onClose={this.onCloseWithdraw} />
      {loading ? <Grid item xs={12}>
        <Grid container justify="center">
          <Grid item>
            <CircularProgress size={17} />
          </Grid>
        </Grid>
      </Grid> : null}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MyPool)));