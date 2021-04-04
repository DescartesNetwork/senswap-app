import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { LanguageRounded, DirectionsBoatRounded } from '@material-ui/icons';

import Ban from 'components/ban';
import Drain from 'components/drain';
import InitializeNetwork from './initializeNetwork';
import NetworkInfo from './info';

import styles from './styles';
import configs from 'configs';

class DAO extends Component {

  render() {
    const { classes } = this.props;
    const { wallet: { user: { role } } } = this.props;
    const { basics: { permission } } = configs;

    if (!permission.includes(role)) return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} lg={8}>
        <Ban />
      </Grid>
    </Grid>
    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h2" align="center" className={classes.headerText}>Welcome to SenDAO</Typography>
            <Typography align="center">Decentralized Autonomous Organizations</Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain />
          </Grid><Grid item xs={12}>
            <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
              <Grid item>
                <IconButton color="secondary" onClick={this.onAdvance}>
                  <LanguageRounded />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="primary">Current Networks</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <NetworkInfo />
          </Grid>
          <Grid item xs={12}>
            <Drain />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
              <Grid item>
                <IconButton color="secondary" onClick={this.onAdvance}>
                  <DirectionsBoatRounded />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="primary">New Network</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <InitializeNetwork />
          </Grid>
        </Grid>
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
)(withStyles(styles)(DAO)));