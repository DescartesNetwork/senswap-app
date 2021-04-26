import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { ThemeProvider, withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';


// Static component
import Sidebar from 'containers/sidebar';
import Header from 'containers/header';
import UiUx from 'containers/uiux';
import Wallet, { configSenWallet } from 'containers/wallet';
// Pages
import NotFound from 'containers/404';
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
      <Grid container justify="center">
        {/* Views */}
        <Grid item xs={12}>
          <Grid container className={classes.noWrap}>
            <Sidebar />
            <Grid item className={classes.stretch}>
              <Grid container>
                <Grid item xs={12}>
                  <Header />
                </Grid>
                <Grid item xs={12}>
                  <Drain />
                </Grid>
                {/* Pages */}
                <Grid item xs={12}>
                  <Switch>
                    <Redirect exact from="/" to="/swap" />
                    <Route exact path='/swap' component={Swap} />
                    <Route path='/pool' component={Pool} />
                    <Route exact path='/faucet' component={Faucet} />
                    <Route path='/issuer' component={Issuer} />
                    <Route path='/audit' component={Audit} />
                    <Route path='/dao' component={DAO} />
                    <Route exact path='*' component={NotFound} />
                  </Switch>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Application */}
        <Grid item xs={12} >
          <UiUx />
          <Wallet />
        </Grid>
      </Grid>
    </ThemeProvider>
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(App)));
