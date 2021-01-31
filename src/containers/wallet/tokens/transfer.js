import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';

import { SendRounded, CloseRounded, EcoRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { getSecretKey } from 'modules/wallet.reducer';


const EMPTY = {
  loading: false,
  txId: '',
  error: '',
}

class TokenTransfer extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      address: '',
      amount: '',
    }
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address, error: '' });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount, error: '' });
  }

  onMax = () => {

  }

  onClear = () => {
    return this.setState({ ...EMPTY, address: '', amount: '' });
  }

  safelyParseAmount = (decimals) => {
    const { amount: strAmount } = this.state;
    const isFloat = strAmount.indexOf('.') !== -1;

    if (!isFloat) {
      let amount = parseInt(strAmount);
      if (!amount) return 0n;
      return global.BigInt(amount) * global.BigInt(10 ** decimals);
    }
    else {
      let [strIntegers, strFloats] = strAmount.split('.');
      if (!parseInt(strIntegers) || !parseInt(strFloats)) return 0n;
      let bigIntIntegers = global.BigInt(strIntegers) * global.BigInt(10 ** decimals);
      while (strFloats.length < decimals) strFloats = strFloats + '0';
      let bigIntFloats = global.BigInt(strFloats.substring(0, decimals));
      return bigIntIntegers + bigIntFloats;
    }
  }

  onTransfer = () => {
    const { wallet: { currentTokenAccount }, getSecretKey } = this.props;
    let decimals = null;
    let tokenAddress = null;
    return this.setState({ loading: true }, () => {
      return sol.getTokenData(currentTokenAccount).then(re => {
        const { token: { address: _address, decimals: _decimals } } = re;
        tokenAddress = _address;
        decimals = _decimals;
        return getSecretKey();
      }).then(secretKey => {
        const { address } = this.state;
        if (!sol.isAddress(tokenAddress)) return this.setState({ ...EMPTY, error: 'Invalid token address' });
        if (!sol.isAddress(currentTokenAccount)) return this.setState({ ...EMPTY, error: 'Invalid sender address' });
        if (!sol.isAddress(address)) return this.setState({ ...EMPTY, error: 'Invalid receiver address' });
        const amount = this.safelyParseAmount(decimals);
        if (!amount) return this.setState({ ...EMPTY, error: 'Invalid amount' });
        const tokenPublicKey = sol.fromAddress(tokenAddress);
        const srcPublicKey = sol.fromAddress(currentTokenAccount);
        const dstPublicKey = sol.fromAddress(address);
        const payer = sol.fromSecretKey(secretKey);
        return sol.transferTokens(amount, tokenPublicKey, srcPublicKey, dstPublicKey, payer);
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY, error: er.toString() });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { address, amount, loading, txId, error } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="body2">Send token</Typography>
      </Grid>
      <Grid item xs={4}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
              />
            </Grid>
            <Grid item>
              <Tooltip title="Maximum amount">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={this.onMax}>
                  <EcoRounded />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={8}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={address}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                {loading ? <CircularProgress size={17} /> : <SendRounded />}
              </IconButton>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={Boolean(txId)}>
          <Alert
            severity="success"
            action={<IconButton onClick={this.onClear} size="small"><CloseRounded /></IconButton>}
          >
            <Typography>Success - <Link color="inherit" href={configs.sol.explorer(txId)} target="_blank">check it out!</Link></Typography>
          </Alert>
        </Collapse>
        <Collapse in={Boolean(error)}>
          <Alert
            severity="error"
            action={<IconButton onClick={this.onClear} size="small"><CloseRounded /></IconButton>}
          >
            <Typography>Error - {error}</Typography>
          </Alert>
        </Collapse>
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
)(withStyles(styles)(TokenTransfer)));