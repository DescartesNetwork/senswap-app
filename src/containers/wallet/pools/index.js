import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import { AddRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import Info from './info';

import styles from './styles';
import { updateToken } from 'modules/wallet.reducer';


class Pools extends Component {
  constructor() {
    super();

    this.state = {
      visible: false
    }
  }

  onAdvanced = () => {
    const { visible } = this.state;
    return this.setState({ visible: !visible });
  }

  render() {
    const { classes } = this.props;
    const { visible } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Swap Accounts</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="Add a new Sen address">
              <IconButton color="primary">
                <AddRounded />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} /> {/* Safe space */}
      <Grid item xs={12}>
        <Info />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateToken
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Pools)));