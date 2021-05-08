import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';

import PrivateRoute from 'containers/auth/privateRoute';
import Header from './header';
import FeaturedPool from './featuredPool';
import LatestPromotion from './latestPromotion';
import MyPool from './myPool';

import styles from './styles';


class Pool extends Component {
  constructor() {
    super();

    this.state = {
      route: '',
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

  render() {
    const { classes, wallet: { user: { address } } } = this.props;
    const { route } = this.state;

    const isLoggedIn = ssjs.isAddress(address);

    return <Grid container justify="center">
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain size={0} />
      </Grid>
      <Grid item xs={12}>
        <FeaturedPool />
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap}>
          <Grid item>
            <Button
              component={RouterLink}
              color={route === 'latest-promotion' ? 'primary' : 'default'}
              to='/pool/latest-promotion'
            >
              <Typography>Latest Promotion</Typography>
            </Button>
          </Grid>
          <Grid item>
            <Button
              component={RouterLink}
              color={route === 'my-pool' ? 'primary' : 'default'}
              to='/pool/my-pool'
              disabled={!isLoggedIn}
            >
              <Typography>My Pool</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Switch>
          <Redirect exact from="/pool" to="/pool/latest-promotion" />
          <Route exact path='/pool/latest-promotion' component={LatestPromotion} />
          <PrivateRoute exact path='/pool/my-pool' component={MyPool} skipRole />
        </Switch>
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
)(withStyles(styles)(Pool)));