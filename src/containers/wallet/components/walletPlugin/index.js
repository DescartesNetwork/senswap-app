import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { SecretKeyWallet, Coin98Wallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';

import LoginDialog from './loginDialog';

import styles from './styles';
import storage from 'helpers/storage';
import { setError, setLoading, unsetLoading } from 'modules/ui.reducer';
import { setWallet, updateWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class WalletPlugin extends Component {

  componentDidMount() {
    const {
      setError, setLoading, unsetLoading,
      setWallet, updateWallet,
      getAccountData,
    } = this.props;

    const wallet = this.reconnect();
    if (!wallet) return;

    return setLoading().then(() => {
      return setWallet(wallet);
    }).then(({ address }) => {
      window.senswap.splt.watch((er, re) => {
        if (er) return;
        const { type, address: changedAddress } = re;
        const { wallet: { accounts } } = this.props;
        if (type === 'account' && accounts.includes(changedAddress))
          return getAccountData(changedAddress, true);
      });
      window.senswap.lamports.watch(address, (er, re) => {
        if (er) return;
        return updateWallet({ lamports: re });
      });
      return unsetLoading();
    }).catch(er => {
      return setError(er);
    });
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

  render() {
    return <LoginDialog />
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
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletPlugin)));