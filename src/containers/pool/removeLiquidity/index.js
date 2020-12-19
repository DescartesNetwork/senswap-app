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

import Address from './address';
import Info from './info';

import configs from 'configs';
import sol from 'helpers/sol';
import styles from './styles';
import { updateSen } from 'modules/wallet.reducer';


class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      senAddress: '',
      dstAddress: '',
      amount: 0,
      senData: {},
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onDestination = (e) => {
    const dstAddress = e.target.value || '';
    return this.setState({ dstAddress });
  }

  onAddress = (senAddress) => {
    return this.setState({ senAddress }, () => {
      if (!sol.isAddress(senAddress)) return;
      return sol.getPoolData(senAddress).then(senData => {
        return this.setState({ senData });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  removeLiquidity = () => {
    const {
      amount,
      senData: { initialized, pool: { token } }
    } = this.state;
    if (!amount || !initialized) return console.error('Invalid input');
    const sen = global.BigInt(amount) * 10n ** (global.BigInt(token.decimals));
    console.log(sen);
  }

  render() {
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;
    const { amount, dstAddress, senAddress } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You will no longer receive liquidity incentive when you remove all your token out of the pool.</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Swap Program"
          variant="outlined"
          value={swapFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Token Program"
          variant="outlined"
          value={tokenFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Address onChange={this.onAddress} />
      </Grid>
      <Grid item xs={12}>
        <Info senAddress={senAddress} />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Destination"
          variant="outlined"
          value={dstAddress}
          onChange={this.onDestination}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Amount (SEN)"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RemoveCircleOutlineRounded />}
          onClick={this.removeLiquidity}
          fullWidth
        >
          <Typography variant="body2">Remove</Typography>
        </Button>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateSen,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));