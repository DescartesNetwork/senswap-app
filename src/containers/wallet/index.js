import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import { } from '@material-ui/icons';

import { BottomDrawer } from 'components/drawers';
import Drain from 'components/drain';
import Header from './header';
import Payer from './payer';
import Tokens from './tokens';
import Pools from './pools';

import SecretKey from './secretKey';
import Keystore from './keystore';

import styles from './styles';
import { closeWallet } from 'modules/wallet.reducer';


class Wallet extends Component {

  renderComponent = () => {
    const { wallet: { address } } = this.props;
    if (address) return;
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <SecretKey />
      </Grid>
      <Grid item xs={12}>
        <Keystore />
      </Grid>
    </Grid>
  }

  render() {
    const { classes } = this.props;
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
                  <Payer />
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <Tokens />
                </Grid>
                <Grid item xs={12}>
                  <Pools />
                </Grid>

                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      {this.renderComponent()}
                    </Grid>
                    <Grid item xs={12}>
                      <Drain small />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </BottomDrawer>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  closeWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));