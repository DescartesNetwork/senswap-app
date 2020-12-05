import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { AddRounded } from '@material-ui/icons';

import styles from './styles';


class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      tokenFactoryAddress: '0x',
      tokenAddress: '0x',
      amount: 0,
      price: 0
    }
  }

  newPool = () => {

  }

  render() {
    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">New pool</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>You are the first liquidity provider. The ratio of tokens you add will set the price of this pool. Once you are happy with the rate click supply to review.</Typography>
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
      <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={this.state.amount}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={this.state.price}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddRounded />}
          onClick={this.newPool}
          fullWidth
        >
          <Typography variant="body2">Create</Typography>
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
)(withStyles(styles)(NewPool)));