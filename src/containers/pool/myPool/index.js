import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { CardPool } from 'senswap-ui/card';

import { } from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class MyPool extends Component {
  constructor() {
    super();

    this.state = {
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

  onDeposit = () => { }

  onWithdraw = () => { }

  render() {
    // const { classes } = this.props;
    const { data } = this.state;

    return <Grid container spacing={2}>
      {data.map((lptData, i) => {
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
        return <Grid item key={i} xs={12} md={6} lg={4}>
          <CardPool
            stake={utils.prettyNumber(ssjs.undecimalize(amount, decimals))}
            icons={icons}
            symbols={symbols}
            onDeposit={this.onDeposit}
            onWithdraw={this.onWithdraw}
          />
        </Grid>
      })}
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