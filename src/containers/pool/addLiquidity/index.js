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

import sol from 'helpers/sol';
import styles from './styles';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';


class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      lptAccount: '',
      amount: 0,
      data: {},
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onAddress = (lptAccount) => {
    return this.setState({ lptAccount }, () => {
      if (!sol.isAddress(lptAccount)) return;
      return sol.getPoolData(lptAccount).then(data => {
        return this.setState({ data });
      }).catch(er => {
        return console.error(er);
      });;
    });
  }

  addLiquidity = () => {
    const {
      amount, lptAccount,
      data: {
        initialized, pool: { address: poolAddress, token, treasury }
      }
    } = this.state;
    const { wallet: { currentTokenAccount, user }, updateWallet, getSecretKey } = this.props;
    if (!initialized || !amount) return console.error('Invalid input');
    return getSecretKey().then(secretKey => {
      const reserve = global.BigInt(amount) * global.BigInt(10 ** token.decimals);
      const lptPublicKey = sol.fromAddress(lptAccount);
      const poolPublicKey = sol.fromAddress(poolAddress);
      const treasuryPublicKey = sol.fromAddress(treasury.address);
      const srcTokenPublickKey = sol.fromAddress(currentTokenAccount);
      const tokenPublicKey = sol.fromAddress(token.address);
      const payer = sol.fromSecretKey(secretKey);
      return sol.addLiquidity(
        reserve,
        poolPublicKey,
        treasuryPublicKey,
        lptPublicKey,
        srcTokenPublickKey,
        tokenPublicKey,
        payer
      );
    }).then(re => {
      if (user.lptAccounts.includes(lptAccount)) return;
      const lptAccounts = [...user.lptAccounts];
      lptAccounts.push(lptAccount);
      return updateWallet({ ...user, lptAccounts });
    }).then(re => {
      // Force to reset info
      return this.setState({ lptAccount: '', amount: 0 }, () => {
        return this.setState({ lptAccount });
      });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { amount, lptAccount } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>The price of token you add will follow the current marginal price of token.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Address onChange={this.onAddress} />
      </Grid>
      <Grid item xs={12}>
        <Info lptAccount={lptAccount} />
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
  updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));