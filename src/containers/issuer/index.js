import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { LockRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import InitializeMint from './initialization';
import RegisterMint from './register';
import UpdateMint from './update';

import styles from './styles';

class Issuer extends Component {

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
                      label="Initialize Token"
                      value="/issuer/initialize-token"
                    />
                    <Tab
                      classes={{
                        root: classes.tab,
                        selected: classes.selectedTab,
                      }}
                      label="Register Token"
                      value="/issuer/register-token"
                      icon={<LockRounded fontSize="small" />}
                    />
                    <Tab
                      classes={{
                        root: classes.tab,
                        selected: classes.selectedTab,
                      }}
                      label="Update Token"
                      value="/issuer/update-token"
                      icon={<LockRounded fontSize="small" />}
                    />
                  </Tabs>
                </Grid>
                <Grid item xs={12}>
                  <Switch>
                    <Redirect exact from="/issuer" to="/issuer/initialize-token" />
                    <Route exact path='/issuer/initialize-token' component={InitializeMint} />
                    <Route exact path='/issuer/register-token' component={RegisterMint} />
                    <Route exact path='/issuer/update-token' component={UpdateMint} />
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
)(withStyles(styles)(Issuer)));