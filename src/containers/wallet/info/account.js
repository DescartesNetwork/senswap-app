import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import { } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class AccountInfo extends Component {
  constructor() {
    super();

    this.state = {
      balance: 0,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { address } } = this.props;
    return utils.getBalance(address).then(re => {
      return this.setState({ balance: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { address } } = this.props;
    const { balance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <Typography variant="body2">Account</Typography>
          </Grid>
          <Grid item className={classes.stretch}>
            <Divider />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      <Grid item xs={8}>
        <TextField
          label="Address"
          variant="outlined"
          color="primary"
          value={address}
          size="small"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="SOL"
          variant="outlined"
          color="primary"
          value={balance}
          size="small"
          fullWidth
        />
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
)(withStyles(styles)(AccountInfo)));