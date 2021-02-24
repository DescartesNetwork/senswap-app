import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Drain from 'components/drain';
import { BaseCard, NotiCard } from 'components/cards';
import NewPool from './newPool';
import AddLiquidity from './addLiquidity';
import RemoveLiquidity from './removeLiquidity';

import styles from './styles';


class Pool extends Component {

  onRoute = (e, route) => {
    return this.props.history.push(route);
  }

  render() {
    const { classes } = this.props;
    const { location: { pathname } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} lg={8}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} sm={8} md={6}>
            <NotiCard
              title="Liquidity provider incentive"
              description="Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity."
              source=""
            />
          </Grid>
          <Grid item xs={12}>
            <Drain small />
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            <BaseCard >
              <Grid container spacing={2}>
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
                      label="Remove Liquidity"
                      value="/pool/remove-liquidity"
                    />
                  </Tabs>
                </Grid>
                <Grid item xs={12}>
                  <Switch>
                    <Redirect exact from="/pool" to="/pool/new-pool" />
                    <Route exact path='/pool/new-pool' component={NewPool} />
                    <Route exact path='/pool/add-liquidity' component={AddLiquidity} />
                    <Route exact path='/pool/remove-liquidity' component={RemoveLiquidity} />
                  </Switch>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
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