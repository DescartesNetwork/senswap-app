import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import eachOfSeries from 'async/eachOfSeries';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Carousel from 'senswap-ui/carousel';

import WalletPlugin, { BucketWatcher, WalletButton } from 'containers/wallet/plugins/walletPlugin';
import { AccountSelection, AccountSend, AccountReceive, AccountAvatar } from 'containers/wallet/plugins/accountPlugin';
import { MintSelection, MintAvatar } from 'containers/wallet/plugins/mintPlugin';
import { PoolAvatar, PoolCard } from 'containers/wallet/plugins/poolPlugin';

// Main components
import Header from './header';
import Info from './info';
import Assets from './assets';

import styles from './styles';
import configs from 'configs';
import WalletHeroImage from 'static/images/wallet-hero.png';


/**
 * Need to call this function at the very first moment of application
 * to avoid unexpected exceptions
 */
export const configSenWallet = () => {
  // Need it cause https://github.com/GoogleChromeLabs/jsbi/issues/30
  global.BigInt.prototype.toJSON = function () {
    return this.toString();
  }
  // Array convenient patch
  // eslint-disable-next-line
  Array.prototype.each = function (promise, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Parse options
        const opts = { skipError: false, skipIndex: false, ...options }
        const { skipError, skipIndex } = opts;
        // Promise series
        let data = [];
        return eachOfSeries(this, (each, i, cb) => {
          return promise(each, i).then(re => {
            data.push(re);
            return cb();
          }).catch(er => {
            if (!skipError) return cb(er);
            if (!skipIndex) data.push(null);
            return cb();
          });
        }, (er) => {
          if (er) return reject(er);
          return resolve(data);
        });
      } catch (er) {
        return reject(er);
      }
    });
  }
  // eslint-disable-next-line
  Array.prototype.zip = function (arr) {
    if (typeof arr !== 'object') return [];
    if (this.length !== arr.length) return [];
    if (!this.length) return [];
    return this.map((value, index) => ([value, arr[index]]));
  }
  // Global access
  const { sol: { node, spltAddress, splataAddress, swapAddress } } = configs;
  window.senswap = {
    splt: new ssjs.LiteSPLT(spltAddress, splataAddress, node),
    swap: new ssjs.LiteSwap(swapAddress, spltAddress, splataAddress, node),
    lamports: new ssjs.Lamports(node),
  }
}

/**
 * Wallet UI buttons, dialogs
 */
export {
  WalletPlugin, WalletButton, BucketWatcher,
  AccountSelection, AccountSend, AccountReceive, AccountAvatar,
  MintSelection, MintAvatar,
  PoolAvatar, PoolCard,
}


class Wallet extends Component {

  renderComponents = () => {
    const { wallet: { user: { address } } } = this.props;

    if (!ssjs.isAddress(address)) return <Grid container>
      <Grid item xs={12}>
        <Carousel data={[{
          subtitle: 'Unlock wallet',
          title: 'Please connect wallet to continue',
          src: WalletHeroImage,
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
    </Grid>
  }

  render() {
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain />
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