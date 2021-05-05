import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { ThemeProvider, withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';

// Components
import PrivateRoute from 'containers/auth/privateRoute';
import Sidebar from 'containers/sidebar';
import UiUx from 'containers/uiux';
import Wallet, { configSenWallet, WalletPlugin } from 'containers/wallet';
import NotFound from 'containers/404';
import Home from 'containers/home';
import Swap from 'containers/swap';
import Pool from 'containers/pool';
import Faucet from 'containers/faucet';
import Issuer from 'containers/issuer';
import Audit from 'containers/audit';
import DAO from 'containers/dao';

// CSS
import styles from './styles';

// Correctly initialize wallet
configSenWallet();


class App extends Component {
  render() {
    const { classes } = this.props;

    return <ThemeProvider>
      <Grid container>
        {/* Views */}
        <Grid item xs={12}>
          <Grid container className={classes.noWrap}>
            <Sidebar />
            <Grid item className={classes.stretch} style={{ overflow: 'auto' }}>
              <Grid container justify="center" >
                {/* Safe space */}
                <Grid item xs={12}>
                  <Drain size={1} />
                </Grid>
                {/* Pages */}
                <Grid item xs={11}>
                  <Switch>
                    <Redirect exact from="/" to="/home" />
                    <Route path='/home' component={Home} />
                    <Route exact path='/swap' component={Swap} />
                    <Route path='/pool' component={Pool} />
                    <Route exact path='/faucet' component={Faucet} />
                    <PrivateRoute path='/issuer' component={Issuer} />
                    <PrivateRoute path='/audit' component={Audit} />
                    <PrivateRoute path='/dao' component={DAO} />
                    <Route path='/wallet' component={Wallet} />
                    <Route exact path='*' component={NotFound} />
                  </Switch>
                </Grid>
                {/* Safe space */}
                <Grid item xs={12}>
                  <Drain size={1} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Application */}
        <Grid item xs={12} >
          <UiUx />
          <WalletPlugin />
        </Grid>
      </Grid>
    </ThemeProvider>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(App)));
