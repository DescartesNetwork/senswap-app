import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { AddCircleOutlineRounded } from '@material-ui/icons';

import configs from 'configs';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import styles from './styles';
import { updateSen } from 'modules/wallet.reducer';


class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      poolAddress: '',
      amount: 0,
      tokenData: {},
      poolData: {},
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
    const { wallet: { token } } = this.props;
    return sol.getTokenData(token).then(tokenData => {
      return this.setState({ tokenData });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAmount = (e) => {
    const amount = e.target.value || 0;
    return this.setState({ amount });
  }

  onAddress = (e) => {
    const poolAddress = e.target.value || '';
    return this.setState({ poolAddress }, () => {
      if (!poolAddress) return console.error('Invalid sen address');
      return sol.getPurePoolData(poolAddress).then(poolData => {
        return this.setState({ poolData });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  addLiquidity = () => {
    const {
      amount, poolAddress,
      poolData: { initialized, token, treasury } } = this.state;
    const { wallet: { token: srcAddress, secretKey, sens }, updateSen } = this.props;
    if (!initialized || !secretKey || !amount) console.error('Invalid input');
    const reserve = global.BigInt(amount) * global.BigInt(10 ** token.decimals);
    const poolPublicKey = sol.fromAddress(poolAddress);
    const treasuryPublicKey = sol.fromAddress(treasury.address);
    const srcTokenPublickKey = sol.fromAddress(srcAddress);
    const tokenPublicKey = sol.fromAddress(token.address);
    const payer = sol.fromSecretKey(secretKey);
    return sol.addLiquidity(
      reserve,
      poolPublicKey,
      treasuryPublicKey,
      srcTokenPublickKey,
      tokenPublicKey,
      payer
    ).then(sen => {
      const newSens = [...sens];
      newSens.push(sen.publicKey.toBase58());
      return updateSen(newSens);
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;
    const { wallet: { token: address } } = this.props;
    const {
      amount, poolAddress,
      tokenData: { initialized, amount: tokenAmount, token },
      poolData: { reserve: poolReserve, sen: poolSen }
    } = this.state;
    if (!initialized) return null;
    const balance = utils.prettyNumber(utils.div(tokenAmount, global.BigInt(10 ** token.decimals)));
    const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** token.decimals)));
    const price = utils.div(poolSen, poolReserve);
    const symbol = token.symbol.join('').replace('-', '');

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
        <TextField
          label={symbol}
          variant="outlined"
          value={address}
          helperText={token.token}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Pool"
          variant="outlined"
          value={poolAddress}
          onChange={this.onAddress}
          helperText={`Reserve: ${reserve} - Price: ${price}`}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          helperText={balance}
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