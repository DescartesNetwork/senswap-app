import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';

import LoginDialog from './loginDialog';
import QRCodeDialog from './qrcodeDialog';

import styles from './styles';
import storage from 'helpers/storage';
import sol from 'helpers/sol';
import SecretKeyWallet from 'containers/wallet/core/secretKeyWallet';
import Coin98Wallet from 'containers/wallet/core/coin98Wallet';
import { setError, setLoading, unsetLoading } from 'modules/ui.reducer';
import { setWallet, updateWallet } from 'modules/wallet.reducer';
import { getAccountData, getMintData, getPoolData, getLPTData } from 'modules/bucket.reducer';


class WalletPlugin extends Component {

  componentDidMount() {
    const {
      setError, setWallet, updateWallet,
      getAccountData, getMintData, getPoolData, getLPTData
    } = this.props;

    const wallet = this.reconnect();
    if (!wallet) return;
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

  reconnect = () => {
    const types = ['SecretKey', 'Keystore', 'Coin98'];
    const walletType = storage.get('WalletType');
    if (!types.includes(walletType)) return null;
    if (walletType === 'SecretKey') return new SecretKeyWallet(storage.get('SecretKey'));
    if (walletType === 'Keystore') return new SecretKeyWallet(storage.get('SecretKey'));
    if (walletType === 'Coin98') return new Coin98Wallet();
    return null;
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

  render() {
    return <Fragment>
      <LoginDialog />
      <QRCodeDialog />
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setLoading, unsetLoading,
  setWallet, updateWallet,
  getAccountData, getMintData, getPoolData, getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletPlugin)));