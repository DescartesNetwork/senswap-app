import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { } from '@material-ui/icons';

import Drain from 'components/drain';
import Network from './network';

import styles from './styles';

class DAO extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h2" align="center" className={classes.headerText}>Welcome to SenDAO</Typography>
            <Typography align="center">Decentralized Autonomous Organizations</Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain />
          </Grid>
          <Grid item xs={12}>
            <Network />
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