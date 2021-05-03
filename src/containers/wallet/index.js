import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Carousel from 'senswap-ui/carousel';

import WalletButton from 'containers/wallet/components/walletButton';
import WalletPlugin from 'containers/wallet/components/walletPlugin';
import { AccountSelection, AccountSend, AccountReceive, AccountAvatar } from 'containers/wallet/components/accountPlugin';
import { MintSelection, MintAvatar } from 'containers/wallet/components/mintPlugin';

// Main components
import Header from './header';
import Info from './info';
import Assets from './assets';
import Pools from './pools';

import styles from './styles';
import configs from 'configs';


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

/**
 * Wallet UI buttons, dialogs
 */
export {
  WalletPlugin, WalletButton,
  AccountSelection, AccountSend, AccountReceive, AccountAvatar,
  MintSelection, MintAvatar,
}


class Wallet extends Component {

  renderComponents = () => {
    const { wallet: { user: { address } } } = this.props;

    if (!ssjs.isAddress(address)) return <Grid container>
      <Grid item xs={12}>
        <Carousel data={[{
          subtitle: 'Unlock wallet',
          title: 'Please connect your wallet to continue',
          src: 'https://source.unsplash.com/random',
          action: <Grid container>
            <Grid item>
              <WalletButton />
            </Grid>
          </Grid>
        }]} />
      </Grid>
    </Grid>
    return <Grid container>
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Assets />
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
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));