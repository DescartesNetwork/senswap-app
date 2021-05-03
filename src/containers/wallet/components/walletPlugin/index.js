import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { SecretKeyWallet, Coin98Wallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';

import LoginDialog from './loginDialog';

import styles from './styles';
import storage from 'helpers/storage';
import { setError } from 'modules/ui.reducer';
import { setWallet, updateWallet } from 'modules/wallet.reducer';
import { getAccountData, getPoolData, getLPTData } from 'modules/bucket.reducer';


class WalletPlugin extends Component {

  componentDidMount() {
    const { setError, setWallet, updateWallet, getAccountData, getPoolData, getLPTData } = this.props;

    const wallet = this.reconnect();
    if (!wallet) return;

    return setWallet(wallet).then(({ address }) => {
      window.senswap.splt.watch((er, re) => {
        if (er) return;
        const { type, address: changedAddress } = re;
        const { wallet: { accounts } } = this.props;
        if (type === 'account' && accounts.includes(changedAddress))
          return getAccountData(changedAddress, true);
      });
      window.senswap.swap.watch((er, re) => {
        if (er) return;
        const { type, address: changedAddress } = re;
        const { wallet: { user: { pools }, lpts } } = this.props;
        if (type === 'pool' && pools.includes(changedAddress))
          return getPoolData(changedAddress, true);
        if (type === 'lpt' && lpts.includes(changedAddress))
          return getLPTData(changedAddress, true);
      });
      window.senswap.lamports.watch(address, (er, re) => {
        if (er) return;
        return updateWallet({ lamports: re });
      });
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
  setError,
  setWallet, updateWallet,
  getAccountData, getPoolData, getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletPlugin)));