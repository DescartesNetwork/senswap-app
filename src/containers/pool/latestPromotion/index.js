import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { CardPool } from 'senswap-ui/card';

import AddLiquidity from 'containers/pool/addLiquidity';
import RemoveLiquidity from 'containers/pool/removeLiquidity';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { openWallet } from 'modules/wallet.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData, getAccountData } from 'modules/bucket.reducer';


class LatestPromotion extends Component {
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

  getPoolDataAndAccountData = (poolAddress) => {
    const { getPoolData, getAccountData } = this.props;
    if (!window.senswap.wallet) return getPoolData(poolAddress);
    return new Promise((resolve, reject) => {
      let poolData = {}
      return getPoolData(poolAddress).then(data => {
        poolData = data;
        return window.senswap.wallet.getAccount();
      }).then(walletAddress => {
        const { mint_lpt: { address: mintAddress } } = poolData;
        return sol.scanAccount(mintAddress, walletAddress);
      }).then(({ address, state }) => {
        if (state) return getAccountData(address);
        return Promise.resolve({});
      }).then(accountData => {
        poolData.accountData = accountData;
        return resolve(poolData);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  fetchData = () => {
    const { setError, getPools, getPool } = this.props;
    return getPools({}, 9, 0).then(poolIds => {
      return poolIds.each(({ _id }) => getPool(_id), { skipError: true, skipIndex: true });
    }).then(data => {
      return data.each(({ address }) => this.getPoolDataAndAccountData(address), { skipError: true, skipIndex: true });
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
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
    const { wallet: { user: { address } }, openWallet } = this.props;
    const { accountData, poolData, visibleDeposit, visibleWithdraw, data } = this.state;

    const isLoggedIn = ssjs.isAddress(address);

    return <Grid container spacing={2}>
      {data.map((poolData, i) => {
        const {
          accountData,
          mint_s: { icon: iconS, symbol: symbolS, decimals },
          mint_a: { icon: iconA, symbol: symbolA },
          mint_b: { icon: iconB, symbol: symbolB },
        } = poolData;
        const { address: accountAddress, amount } = accountData || {}
        const isLP = ssjs.isAddress(accountAddress);
        const icons = [iconA, iconB, iconS];
        const symbols = [symbolA, symbolB, symbolS];
        return <Grid item key={i} xs={12} md={6} lg={4}>
          <CardPool
            icons={icons}
            symbols={symbols}
            stake={utils.prettyNumber(ssjs.undecimalize(amount, decimals)) || '0'}
            {...(!isLoggedIn ? { onConnect: openWallet } : null)}
            {...(isLP ? { onWithdraw: () => this.onOpenWithdraw(i) } : null)}
            onDeposit={() => this.onOpenDeposit(i)}
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
  openWallet,
  getPools, getPool,
  getPoolData, getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LatestPromotion)));