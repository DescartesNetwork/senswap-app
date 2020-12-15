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

import { RemoveCircleOutlineRounded } from '@material-ui/icons';

import configs from 'configs';
import sol from 'helpers/sol';
import styles from './styles';


class WithdrawLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      sen: '',
      amount: 0,
      tokenValue: {},
      poolValue: {},
      senValue: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { token, pool } } = this.props;
    return sol.getTokenAccountData(token).then(tokenValue => {
      this.setState({ tokenValue });
      return sol.getPoolAccountData(pool);
    }).then(poolValue => {
      return this.setState({ poolValue });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAmount = (e) => {
    const amount = e.target.value;
    return this.setState({ amount });
  }

  onSen = (e) => {
    const pool = e.target.value;
    return this.setState({ sen }, () => {
      if (!pool) return console.error('Invalid pool address');
      if (pool.length !== 44) return console.error('Invalid address length');
      return sol.getSenAccountData(pool).then(senValue => {
        return this.setState({ senValue });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  withdrawLiquidity = () => {
    const { amount, poolValue, tokenValue } = this.state;
    const { wallet: { token, pool, secretKey } } = this.props;
    if (!poolValue.token || !tokenValue.token || !secretKey || !amount) console.error('Invalid input');
    const sen = global.BigInt(amount * 10 ** tokenValue.decimals);
    const poolPublicKey = sol.fromAddress(pool);
    const treasuryPublicKey = sol.fromAddress(poolValue.treasury);
    const dstTokenPublickKey = sol.fromAddress(token);
    const tokenPublicKey = sol.fromAddress(poolValue.token);
    const payer = sol.fromSecretKey(secretKey);
    return sol.addLiquidity(
      sen,
      poolPublicKey,
      treasuryPublicKey,
      senPublicKey,
      dstTokenPublickKey,
      tokenPublicKey,
      payer
    ).then(sen => {
      return console.log(sen);
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { sol: { tokenFactoryAddress, swapFactoryAddress } } = configs;
    const { wallet: { token: address, pool } } = this.props;
    const { tokenValue, poolValue, senValue, amount, sen } = this.state;
    if (!tokenValue.token || !poolValue.token) return null;
    const balance = (tokenValue.amount / global.BigInt(10 ** tokenValue.decimals)).toString();
    const balanceDecimals = (tokenValue.amount % global.BigInt(10 ** tokenValue.decimals)).toString();
    const reserve = (poolValue.reserve / global.BigInt(10 ** tokenValue.decimals)).toString();
    const reserveDecimals = (poolValue.reserve % global.BigInt(10 ** tokenValue.decimals)).toString();
    const price = Number(poolValue.sen) / Number(poolValue.reserve);

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You will no longer receive liquidity incentive when you withdraw all your token out of the pool.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Swap Factory Address"
          variant="outlined"
          value={swapFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Factory Address"
          variant="outlined"
          value={tokenFactoryAddress}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={tokenValue.symbol.join('').replace('-', '')}
          variant="outlined"
          value={address}
          helperText={tokenValue.token}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Pool"
          variant="outlined"
          value={pool}
          onChange={this.onPool}
          helperText={`Reserve: ${Number(reserve + '.' + reserveDecimals)} - Price: ${price}`}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Sen"
          variant="outlined"
          value={sen}
          onChange={this.onSen}
          helperText={`Balance`}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          helperText={Number(balance + '.' + balanceDecimals)}
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
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WithdrawLiquidity)));