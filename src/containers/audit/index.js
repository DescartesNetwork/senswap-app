import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { BaseCard } from 'components/cards';
import SubmitPool from './submit';
import VerifyPool from './verify';

import styles from './styles';


class Audit extends Component {

  onRoute = (e, route) => {
    return this.props.history.push(route);
  }

  render() {
    const { classes } = this.props;
    const { location: { pathname } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12} md={8} lg={6}>
        <BaseCard>
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
                  label="Submit Pool"
                  value="/audit/submit-pool"
                />
                <Tab
                  classes={{
                    root: classes.tab,
                    selected: classes.selectedTab,
                  }}
                  label="Verify Pool"
                  value="/audit/verify-pool"
                />
              </Tabs>
            </Grid>
            <Grid item xs={12}>
              <Switch>
                <Redirect exact from="/audit" to="/audit/submit-pool" />
                <Route exact path='/audit/submit-pool/:poolAddress?' component={SubmitPool} />
                <Route exact path='/audit/verify-pool' component={VerifyPool} />
              </Switch>
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
)(withStyles(styles)(Audit)));