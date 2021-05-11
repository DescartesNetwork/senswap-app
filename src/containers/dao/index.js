import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';

import { LanguageRounded } from '@material-ui/icons';

import NetworkInfo from './info';

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
          </Grid><Grid item xs={12}>
            <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
              <Grid item>
                <IconButton color="secondary" onClick={this.onAdvance}>
                  <LanguageRounded />
                </IconButton>
              </Grid>
              <Grid item>
                <Typography variant="h6" color="primary">Current Pool</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <NetworkInfo />
          </Grid>
          <Grid item xs={12}>
            <Drain />
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
)(withStyles(styles)(DAO)));