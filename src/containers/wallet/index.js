import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import { BottomDrawer } from 'components/drawers';
import Drain from 'components/drain';
// Main components
import Header from './header';
import LogIn from './login';
import Payer from './payer';
import Tokens from './tokens';
import Pools from './pools';
// Subapp
import QRCode from './qrcode';
import Unlock from './unlock';

import styles from './styles';
import storage from 'helpers/storage';
import sol from 'helpers/sol';
import { setError, setLoading, unsetLoading } from 'modules/ui.reducer';
import { unlockWallet, setWallet, updateWallet, closeWallet } from 'modules/wallet.reducer';
import { setItem } from 'modules/bucket.reducer';


/**
 * Need to call this function at the very first moment of application
 * to avoid unexpected exception
 */
export const configSenWallet = () => {
  // Need it cause https://github.com/GoogleChromeLabs/jsbi/issues/30
  global.BigInt.prototype.toJSON = function () {
    return this.toString();
  }
  // Global access
  window.senwallet = {
    src20: new ssjs.SRC20(),
    swap: new ssjs.Swap()
  }
}


class Wallet extends Component {

  componentDidMount() {
    const { setError, setWallet, setItem } = this.props;
    const address = storage.get('address');
    const keystore = storage.get('keystore');
    if (!address || !keystore) {
      storage.clear('address');
      storage.clear('keystore');
      return;
    }
    return setWallet(address, keystore).then(re => {
      window.senwallet.src20.watch((er, re) => {
        if (er) return setError(er);
        const { wallet: { user: { tokens }, accounts } } = this.props;
        const address = re.address;
        if (tokens.includes(address)) return setItem(re);
        if (accounts.includes(address)) return setItem(re);
      });
      window.senwallet.swap.watch((er, re) => {
        if (er) return setError(er);
        const { wallet: { user: { pools }, lpts } } = this.props;
        const address = re.address;
        if (pools.includes(address)) return setItem(re);
        if (lpts.includes(address)) return setItem(re);
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
      wallet: { user: { tokens, pools }, accounts, lpts },
      setError, setLoading, unsetLoading,
      unlockWallet, updateWallet,
      setItem,
    } = this.props;
    let secretKey = null;
    return unlockWallet().then(re => {
      secretKey = re;
      return setLoading();
    }).then(re => {
      return Promise.all(tokens.map(tokenAddress => {
        return sol.scanAccount(tokenAddress, secretKey);
      }));
    }).then(data => {
      data = data.map(({ data }) => data).flat();
      return Promise.all(data.map(accountData => {
        return setItem(accountData);
      }));
    }).then(data => {
      const newAccounts = [...accounts];
      data.forEach(({ address: accountAddress }) => {
        if (!newAccounts.includes(accountAddress))
          return newAccounts.push(accountAddress);
      });
      const mainAccount = newAccounts[0];
      return updateWallet({ accounts: newAccounts, mainAccount });
    }).then(re => {
      return Promise.all(pools.map(poolAddress => {
        return sol.scanLPT(poolAddress, secretKey);
      }));
    }).then(data => {
      data = data.map(({ data }) => data).flat();
      return Promise.all(data.map(lptData => {
        return setItem(lptData);
      }));
    }).then(data => {
      const newLPTs = [...lpts];
      data.forEach(({ address: lptAddress }) => {
        if (!newLPTs.includes(lptAddress))
          return newLPTs.push(lptAddress);
      });
      return updateWallet({ lpts: newLPTs });
    }).then(re => {
      return unsetLoading();
    }).catch(er => {
      return setError(er);
    });
  }

  renderComponents = () => {
    const { wallet: { user: { address } } } = this.props;
    if (!address) return <LogIn />
    return <Grid container spacing={2}>
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
    const { wallet: { visible }, closeWallet } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BottomDrawer visible={visible} onClose={closeWallet}>
          <Grid container spacing={2} justify="center">
            <Grid item xs={11} md={10}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Header />
                </Grid>
                <Grid item xs={12}>
                  <Drain />
                </Grid>
                <Grid item xs={12}>
                  {this.renderComponents()}
                </Grid>
                <Grid item xs={12}>
                  <Drain />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </BottomDrawer>
      </Grid>
      <Grid item xs={12}>
        <QRCode />
        <Unlock />
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
  unlockWallet, setWallet, updateWallet, closeWallet,
  setItem,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));