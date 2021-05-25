import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { SecretKeyWallet, Coin98Wallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';

import LoginDialog from './loginDialog';
import Watcher from './watcher';
import WalletButton_ from './walletButton';

import styles from './styles';
import session from 'helpers/session';
import { setError, setLoading, unsetLoading } from 'modules/ui.reducer';
import { setWallet, updateWallet } from 'modules/wallet.reducer';
import { getAccountData, getPoolData } from 'modules/bucket.reducer';


export const BucketWatcher = Watcher;
export const WalletButton = WalletButton_;

class WalletPlugin extends Component {

  async componentDidMount() {
    const {
      setError, setLoading, unsetLoading,
      setWallet, updateWallet,
      getAccountData, getPoolData,
    } = this.props;

    const wallet = this.reconnect();
    if (!wallet) return;

    console.log(wallet)

    await setLoading();
    try {
      const { user: { address } } = await setWallet(wallet);
      window.senswap.splt.watch((er, re) => {
        if (er) return;
        const { type, address: changedAddress } = re;
        const { wallet: { accounts } } = this.props;
        if (type === 'account' && accounts.includes(changedAddress)) {
          return getAccountData(changedAddress, true);
        }
      });
      window.senswap.swap.watch((er, re) => {
        if (er) return;
        const { type, address: changedAddress } = re;
        const { bucket } = this.props;
        if (type === 'pool' && bucket[changedAddress]) {
          return getPoolData(changedAddress, true);
        }
      });
      window.senswap.lamports.watch(address, (er, re) => {
        if (er) return;
        return updateWallet({ lamports: re });
      });
    } catch (er) {
      await setError(er);
    }
    await unsetLoading();
  }

  reconnect = () => {
    const types = ['SecretKey', 'Keystore', 'Coin98'];
    const walletType = session.get('WalletType');
    if (!types.includes(walletType)) return null;
    if (walletType === 'SecretKey') return new SecretKeyWallet(session.get('SecretKey'));
    if (walletType === 'Keystore') return new SecretKeyWallet(session.get('SecretKey'));
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
  getAccountData, getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletPlugin)));