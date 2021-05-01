import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Carousel from 'senswap-ui/carousel';

import Login from 'containers/wallet/components/login';

// Main components
import Header from './header';
import Info from './info';
import Assets from './assets';
import Payer from './payer';
import Tokens from './tokens';
import Pools from './pools';
// Subapp
import QRCode from './qrcode';

import styles from './styles';
import configs from 'configs';
import storage from 'helpers/storage';
import sol from 'helpers/sol';
import SecretKeyWallet from 'containers/wallet/core/secretKeyWallet';
import { setError, setLoading, unsetLoading } from 'modules/ui.reducer';
import { setWallet, updateWallet, closeWallet } from 'modules/wallet.reducer';
import { getAccountData, getMintData, getPoolData, getLPTData } from 'modules/bucket.reducer';


/**
 * Need to call this function at the very first moment of application
 * to avoid unexpected exception
 */
export const configSenWallet = () => {
  // Need it cause https://github.com/GoogleChromeLabs/jsbi/issues/30
  global.BigInt.prototype.toJSON = function () {
    return this.toString();
  }
  // Configs
  const { sol: { node, spltAddress, splataAddress, swapAddress } } = configs;
  // Global access
  window.senswap = {
    splt: new ssjs.SPLT(spltAddress, splataAddress, node),
    swap: new ssjs.Swap(swapAddress, spltAddress, node),
    lamports: new ssjs.Lamports(node),
  }
}


class Wallet extends Component {

  componentDidMount() {
    const {
      setError, setWallet, updateWallet,
      getAccountData, getMintData, getPoolData, getLPTData
    } = this.props;
    const secretKey = storage.get('SecretKey');
    if (!secretKey) return;
    const wallet = new SecretKeyWallet(secretKey);
    return setWallet(wallet).then(({ address }) => {
      window.senswap.splt.watch((er, re) => {
        if (er) return;
        const { type, accountId } = re;
        const { wallet: { user: { mints }, accounts } } = this.props;
        if (type === 'mint' && mints.includes(accountId)) return getMintData(accountId, true);
        if (type === 'account' && accounts.includes(accountId)) return getAccountData(accountId, true);
      });
      window.senswap.swap.watch((er, re) => {
        if (er) return;
        const { type, accountId } = re;
        const { wallet: { user: { pools }, lpts } } = this.props;
        if (type === 'pool' && pools.includes(accountId)) return getPoolData(accountId, true);
        if (type === 'lpt' && lpts.includes(accountId)) return getLPTData(accountId, true);
      });
      window.senswap.lamports.watch(address, (er, re) => {
        if (er) return;
        return updateWallet({ lamports: re });
      });
    }).catch(er => {
      return setError(er);
    });
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: { address: prevAddress } } } = prevProps;
    const { wallet: { user: { address } } } = this.props;
    if (!isEqual(address, prevAddress)) this.fetchData();
  }

  fetchData = () => {
    const {
      wallet: { user: { address, mints }, accounts },
      setError, setLoading, unsetLoading,
      getAccountData,
      updateWallet,
    } = this.props;
    if (!ssjs.isAddress(address)) return;

    return setLoading().then(re => {
      return window.senswap.lamports.get(address);
    }).then(lamports => {
      return updateWallet({ lamports });
    }).then(re => {
      return Promise.all(mints.map(mintAddress => {
        return sol.scanAccount(mintAddress, address);
      }));
    }).then(data => {
      data = data.filter(({ state }) => state > 0);
      return Promise.all(data.map(({ address }) => {
        return getAccountData(address);
      }));
    }).then(data => {
      const newAccounts = [...accounts];
      data.forEach(({ address: accountAddress }) => {
        if (!newAccounts.includes(accountAddress))
          return newAccounts.push(accountAddress);
      });
      const mainAccount = newAccounts[0];
      return updateWallet({ accounts: newAccounts, mainAccount });
    }).then(() => {
      return unsetLoading();
    }).catch(er => {
      return setError(er);
    });
  }

  renderComponents = () => {
    const { wallet: { user: { address } } } = this.props;

    if (!ssjs.isAddress(address)) return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Carousel data={[{
          subtitle: 'Unlock wallet',
          title: 'Please connect your wallet to continue',
          src: 'https://source.unsplash.com/random',
          action: <Grid container>
            <Grid item>
              <Login />
            </Grid>
          </Grid>
        }]} />
      </Grid>
    </Grid>
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Grid item xs={12}>
        <Assets />
      </Grid>
      <Grid item xs={12} md={6}>
        <Payer />
      </Grid>
      <Grid item xs={12} md={6}>
        <Tokens />
      </Grid>
      <Grid item xs={12}>
        <Drain />
      </Grid>
      <Grid item xs={12}>
        <Pools />
      </Grid>
    </Grid>
  }

  render() {
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain size={3} />
      </Grid>

      <Grid item xs={12}>
        {this.renderComponents()}
      </Grid>
      <Grid item xs={12}>
        <Drain />
      </Grid>
      <Grid item xs={12}>
        <QRCode />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setLoading, unsetLoading,
  setWallet, updateWallet, closeWallet,
  getAccountData, getMintData, getPoolData, getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));