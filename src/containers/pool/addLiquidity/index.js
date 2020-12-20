import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { AddCircleOutlineRounded } from '@material-ui/icons';

import Address from './address';
import Info from './info';

import configs from 'configs';
import sol from 'helpers/sol';
import styles from './styles';
import { updateSen } from 'modules/wallet.reducer';


class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      senAddress: '',
      amount: 0,
      senData: {},
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || 0;
    return this.setState({ amount });
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

  addLiquidity = () => {
    const {
      amount, senAddress,
      senData: {
        initialized, pool: { address: poolAddress, token, treasury }
      }
    } = this.state;
    const { wallet: { token: srcAddress, secretKey, sens }, updateSen } = this.props;
    if (!initialized || !secretKey || !amount) console.error('Invalid input');
    const reserve = global.BigInt(amount) * global.BigInt(10 ** token.decimals);
    const senPublicKey = sol.fromAddress(senAddress);
    const poolPublicKey = sol.fromAddress(poolAddress);
    const treasuryPublicKey = sol.fromAddress(treasury.address);
    const srcTokenPublickKey = sol.fromAddress(srcAddress);
    const tokenPublicKey = sol.fromAddress(token.address);
    const payer = sol.fromSecretKey(secretKey);
    return sol.addLiquidity(
      reserve,
      poolPublicKey,
      treasuryPublicKey,
      senPublicKey,
      srcTokenPublickKey,
      tokenPublicKey,
      payer
    ).then(re => {
      if (sens.includes(senAddress)) return;
      const newSens = [...sens];
      newSens.push(senAddress);
      return updateSen(newSens);
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;
    const { amount, senAddress } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>The price of token you add will follow the current marginal price of token.</Typography>
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
          label="Amount"
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
          startIcon={<AddCircleOutlineRounded />}
          onClick={this.addLiquidity}
          fullWidth
        >
          <Typography variant="body2">Add</Typography>
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
)(withStyles(styles)(AddLiquidity)));