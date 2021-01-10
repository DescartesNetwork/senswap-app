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

import sol from 'helpers/sol';
import styles from './styles';
import { getSecretKey } from 'modules/wallet.reducer';

class RemoveLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      lptAccount: '',
      dstAccount: '',
      amount: 0,
      data: {},
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onDestination = (e) => {
    const dstAccount = e.target.value || '';
    return this.setState({ dstAccount });
  }

  onAddress = (lptAccount) => {
    return this.setState({ lptAccount }, () => {
      if (!sol.isAddress(lptAccount)) return;
      return sol.getPoolData(lptAccount).then(data => {
        return this.setState({ data });
      }).catch(er => {
        return console.error(er);
      });
    });
  }

  removeLiquidity = () => {
    const {
      amount, dstAccount, lptAccount,
      data: { initialized, pool: { address: poolAddress, token, treasury } }
    } = this.state;
    const { getSecretKey } = this.props;
    if (!amount || !initialized) return console.error('Invalid input');
    return getSecretKey().then(secretKey => {
      const lpt = global.BigInt(amount) * 10n ** global.BigInt(token.decimals);
      const lptPublicKey = sol.fromAddress(lptAccount);
      const poolPublicKey = sol.fromAddress(poolAddress);
      const treasuryPublicKey = sol.fromAddress(treasury.address);
      const dstTokenPublickKey = sol.fromAddress(dstAccount);
      const tokenPublicKey = sol.fromAddress(token.address);
      const payer = sol.fromSecretKey(secretKey);
      return sol.removeLiquidity(
        lpt,
        poolPublicKey,
        treasuryPublicKey,
        lptPublicKey,
        dstTokenPublickKey,
        tokenPublicKey,
        payer
      )
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
    const { amount, dstAccount, lptAccount } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You will no longer receive liquidity incentive when you remove all your token out of the pool.</Typography>
      </Grid>
      <Grid item xs={12}>
        <Address onChange={this.onAddress} />
      </Grid>
      <Grid item xs={12}>
        <Info lptAccount={lptAccount} />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Destination"
          variant="outlined"
          value={dstAccount}
          onChange={this.onDestination}
          fullWidth
        />
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
  getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RemoveLiquidity)));