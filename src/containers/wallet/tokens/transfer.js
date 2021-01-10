import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';

import { SendRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { getSecretKey } from 'modules/wallet.reducer';


class TokenTransfer extends Component {
  constructor() {
    super();

    this.state = {
      receiverAddress: '',
      amount: '',
      error: '',
    }
  }

  onAddress = (e) => {
    const receiverAddress = e.target.value || '';
    return this.setState({ receiverAddress, error: '' });
  }


  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount, error: '' });
  }

  safelyParseAmount = (decimals) => {
    const { amount: strAmount } = this.state;
    const isFloat = strAmount.indexOf('.') !== -1;

    if (!isFloat) {
      let amount = parseInt(strAmount);
      if (!amount) return 0n;
      return global.BigInt(amount) * 10n ** global.BigInt(decimals);
    }
    else {
      let [strIntegers, strFloats] = strAmount.split('.');
      if (!parseInt(strIntegers) || !parseInt(strFloats)) return 0n;
      let bigIntIntegers = global.BigInt(strIntegers) * 10n ** global.BigInt(decimals);
      while (strFloats.length < decimals) strFloats = strFloats + '0';
      let bigIntFloats = global.BigInt(strFloats.substring(0, decimals));
      return bigIntIntegers + bigIntFloats;
    }
  }

  onTransfer = () => {
    const { wallet: { currentTokenAccount }, getSecretKey } = this.props;
    let decimals = null;
    let tokenAddress = null;
    return sol.getTokenData(currentTokenAccount).then(re => {
      const { token: { address: _address, decimals: _decimals } } = re;
      tokenAddress = _address;
      decimals = _decimals;
      return getSecretKey();
    }).then(secretKey => {
      const { receiverAddress } = this.state;
      if (!sol.isAddress(tokenAddress))
        return this.setState({ error: 'Invalid token address' });
      if (!sol.isAddress(currentTokenAccount))
        return this.setState({ error: 'Invalid sender address' });
      if (!sol.isAddress(receiverAddress))
        return this.setState({ error: 'Invalid receiver address' });
      const amount = this.safelyParseAmount(decimals);
      if (!amount) return this.setState({ error: 'Invalid amount' });
      const tokenPublicKey = sol.fromAddress(tokenAddress);
      const srcPublicKey = sol.fromAddress(currentTokenAccount);
      const dstPublicKey = sol.fromAddress(receiverAddress);
      const payer = sol.fromSecretKey(secretKey);
      return sol.transfer(amount, tokenPublicKey, srcPublicKey, dstPublicKey, payer);
    }).then(re => {
      return this.setState({ error: '' });
    }).catch(er => {
      return this.setState({ error: er.toString() });
    });
  }

  render() {
    const { classes } = this.props;
    const { receiverAddress, amount, error } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={6} sm={7} md={8}>
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={receiverAddress}
                onKeyPress={e => e.key === 'Enter' ? this.onTransfer : null}
                fullWidth
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={5} md={4}>
        <Paper elevation={0} className={classes.paper}>
          <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                <SendRounded />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      {error ? <Grid item xs={12}>
        <Typography color="error">{error}</Typography>
      </Grid> : null}
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
)(withStyles(styles)(TokenTransfer)));