import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
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
import { setError } from 'modules/ui.reducer';
import { unlockWallet, setWallet, updateWallet, closeWallet } from 'modules/wallet.reducer';
import { setItem } from 'modules/bucket.reducer';


/**
 * Need to call this function in very first age of application
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
    const { setError, setWallet } = this.props;
    const address = storage.get('address');
    const keystore = storage.get('keystore');
    if (!address || !keystore) {
      storage.clear('address');
      storage.clear('keystore');
      return;
    }
    return setWallet(address, keystore).then(re => {
      return this.fetchData();
    }).catch(er => {
      return setError(er);
    });
  }

  fetchData = () => {
    const {
      setError,
      unlockWallet, updateWallet,
      setItem,
    } = this.props;
    return unlockWallet().then(secretKey => {
      const { wallet: { user: { tokens } } } = this.props;
      return Promise.all(tokens.map(tokenAddress => {
        return sol.scanSRC20Account(tokenAddress, secretKey);
      }));
    }).then(data => {
      data = data.map(({ data }) => data).flat();
      return Promise.all(data.map(accountData => {
        return setItem(accountData);
      }));
    }).then(re => {
      const data = re.map(each => {
        return Object.keys(each)[0];
      });
      const { wallet } = this.props;
      const accounts = [...wallet.accounts];
      data.forEach(accountAddress => {
        if (!accounts.includes(accountAddress))
          return accounts.push(accountAddress);
      });
      const mainAccount = accounts[0];
      return updateWallet({ accounts, mainAccount });
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet, setWallet, updateWallet, closeWallet,
  setItem,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));