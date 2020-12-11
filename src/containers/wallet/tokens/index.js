import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { AccountBalanceRounded } from '@material-ui/icons';

import Manage from './manage';
import List from './list';
import Info from './info';
import Create from './create';

import styles from './styles';
import { updateToken } from 'modules/wallet.reducer';


class Tokens extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <AccountBalanceRounded />
            </IconButton>
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Tokens</Typography>
          </Grid>
          <Grid item>
            <Manage />
          </Grid>
          <Grid item>
            <List />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Info />
      </Grid>
      <Grid item xs={12}>
        <Create />
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
)(withStyles(styles)(Tokens)));