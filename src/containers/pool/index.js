import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { BaseCard } from 'components/cards';
import Header from './header';
import FeaturedPool from './featuredPool';
import LatestPromotion from './latestPromotion';
import NewPool from './newPool';
import AddLiquidity from './addLiquidity';
import RemoveLiquidity from './removeLiquidity';

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

  onRoute = (e, route) => {
    return this.props.history.push(route);
  }

  render() {
    const { classes } = this.props;
    const { location: { pathname } } = this.props;
    const { route } = this.state;

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
        <Grid container>
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
          <Route exact path='/pool/new-pool' component={NewPool} />
          <Route exact path='/pool/add-liquidity' component={AddLiquidity} />
          <Route exact path='/pool/remove-liquidity' component={RemoveLiquidity} />
        </Switch>
      </Grid>
      <Grid item xs={12} md={8} lg={6}>
        <BaseCard >
          <Grid container>
            <Grid item xs={12}>
              <Tabs
                value={pathname}
                onChange={this.onRoute}
                className={classes.navigation}
                variant="fullWidth"
              >
                <Tab
                  classes={{
                    root: classes.tab,
                    selected: classes.selectedTab,
                  }}
                  label="New Pool"
                  value="/pool/new-pool"
                />
                <Tab
                  classes={{
                    root: classes.tab,
                    selected: classes.selectedTab,
                  }}
                  label="Add Liquidity"
                  value="/pool/add-liquidity"
                />
                <Tab
                  classes={{
                    root: classes.tab,
                    selected: classes.selectedTab,
                  }}
                  label="Withdraw Liquidity"
                  value="/pool/remove-liquidity"
                />
              </Tabs>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
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
)(withStyles(styles)(Pool)));