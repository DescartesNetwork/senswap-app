import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import { GroupRounded } from '@material-ui/icons';

import NetworkSelection from 'containers/wallet/components/networkSelection';
import FoundationAction from './action';

import styles from './styles';
import { getNetworks, getNetwork } from 'modules/network.reducer';
import { setError } from 'modules/ui.reducer';


class Foundation extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  onData = (data) => {
    return this.setState({ data });
  }

  render() {
    const { classes } = this.props;
    const { data: { address } } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton color="secondary">
              <GroupRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6" color="primary">Foundation</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <NetworkSelection onChange={this.onData} />
      </Grid>
      <Grid item xs={12}>
        <FoundationAction network={address} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  network: state.network,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getNetworks, getNetwork,
  setError,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Foundation)));