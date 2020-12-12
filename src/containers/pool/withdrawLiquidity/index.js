import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { RemoveCircleOutlineRounded } from '@material-ui/icons';

import styles from './styles';


class WithdrawLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      tokenFactoryAddress: '0x',
      tokenAddress: '0x',
      amount: 0,
    }
  }

  withdrawLiquidity = () => {

  }

  render() {
    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You will no longer receive liquidity incentive when you withdraw all your token out of the pool.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Factory Address"
          variant="outlined"
          value={this.state.tokenFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Address"
          variant="outlined"
          value={this.state.tokenAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Amount"
          variant="outlined"
          value={this.state.amount}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RemoveCircleOutlineRounded />}
          onClick={this.withdrawLiquidity}
          fullWidth
        >
          <Typography variant="body2">Withdraw</Typography>
        </Button>
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
)(withStyles(styles)(WithdrawLiquidity)));