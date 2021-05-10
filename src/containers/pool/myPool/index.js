import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { CardPool } from 'senswap-ui/card';

import AddLiquidity from '../addLiquidity';
import RemoveLiquidity from '../removeLiquidity';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class MyPool extends Component {
  constructor() {
    super();

    this.state = {
      visibleDeposit: false,
      visibleWithdraw: false,
      poolData: {},
      accountData: {},
      data: []
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

  fetchData = () => {
    const { wallet: { accounts }, setError, getAccountData } = this.props;
    return accounts.each(address => {
      return getAccountData(address);
    }, { skipError: true, skipIndex: true }).then(data => {
      data = data.filter(({ pool }) => {
        const { address } = pool || {};
        return ssjs.isAddress(address);
      });
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
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
    // const { classes } = this.props;
    const { poolData, accountData, visibleDeposit, visibleWithdraw, data } = this.state;

    return <Grid container spacing={2}>
      {data.map((lptData, index) => {
        const {
          amount, mint: { decimals },
          pool: {
            mint_s: { icon: iconS, symbol: symbolS },
            mint_a: { icon: iconA, symbol: symbolA },
            mint_b: { icon: iconB, symbol: symbolB },
          }
        } = lptData;
        const icons = [iconA, iconB, iconS];
        const symbols = [symbolA, symbolB, symbolS];
        return <Grid item key={index} xs={12} md={6} lg={4}>
          <CardPool
            stake={utils.prettyNumber(ssjs.undecimalize(amount, decimals))}
            icons={icons}
            symbols={symbols}
            onDeposit={() => this.onOpenDeposit(index)}
            onWithdraw={() => this.onOpenWithdraw(index)}
          />
        </Grid>
      })}
      <AddLiquidity poolData={poolData} visible={visibleDeposit} onClose={this.onCloseDeposit} />
      <RemoveLiquidity data={accountData} visible={visibleWithdraw} onClose={this.onCloseWithdraw} />
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MyPool)));