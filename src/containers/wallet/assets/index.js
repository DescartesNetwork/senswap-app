import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';

import { AddRounded } from 'senswap-ui/icons';

import { MintSelection } from 'containers/wallet';
import CreateAccount from './createAccount';
import Accounts from './accounts';
import LPTs from './lpts';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';
import stakeAccounts from './stakeAccounts';


class Assets extends Component {
  constructor() {
    super();

    this.state = {
      route: '',
      visibleMintSelection: false,
      mintData: {},
      visibleCreateAccount: false,
    }
  }

  componentDidMount() {
    this.parseRoute();
  }

  componentDidUpdate(prevProps) {
    const { location: prevLocation } = prevProps;
    const { location } = this.props;
    if (!isEqual(prevLocation, location)) this.parseRoute();
  }

  parseRoute = () => {
    const { location: { pathname } } = this.props;
    const route = pathname.split('/')[2];
    return this.setState({ route })
  }

  onOpenMintSelection = () => this.setState({ visibleMintSelection: true });
  onCloseMintSelection = () => this.setState({ visibleMintSelection: false });
  onMintData = (mintData) => {
    return this.setState({ mintData }, () => {
      this.onOpenCreateAccount();
      return this.onCloseMintSelection();
    });
  }

  onOpenCreateAccount = () => this.setState({ visibleCreateAccount: true });
  onCloseCreateAccount = () => this.setState({ visibleCreateAccount: false });


  render() {
    const { classes } = this.props;
    const { route, visibleCreateAccount, mintData, visibleMintSelection } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Grid container className={classes.noWrap}>
              <Grid item>
                <Button
                  component={RouterLink}
                  color={route === 'accounts' ? 'primary' : 'default'}
                  to='/wallet/accounts'
                >
                  <Typography>Asset Balances</Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={RouterLink}
                  color={route === 'lpts' ? 'primary' : 'default'}
                  to='/wallet/lpts'
                >
                  <Typography>LP Tokens</Typography>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={RouterLink}
                  color={route === 'stake' ? 'primary' : 'default'}
                  to='/wallet/stake'
                >
                  <Typography>Stake Accounts</Typography>
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <IconButton color="primary" onClick={this.onOpenMintSelection}>
              <AddRounded />
            </IconButton>
            <MintSelection
              visible={visibleMintSelection}
              onClose={this.onCloseMintSelection}
              onChange={this.onMintData}
            />
            <CreateAccount
              visible={visibleCreateAccount}
              onClose={this.onCloseCreateAccount}
              mintData={mintData}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Switch>
          <Redirect exact from="/wallet" to="/wallet/accounts" />
          <Route exact path='/wallet/accounts' component={Accounts} />
          <Route exact path='/wallet/lpts' component={LPTs} />
          <Route exact path='/wallet/stake' component={stakeAccounts} />
        </Switch>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Assets)));