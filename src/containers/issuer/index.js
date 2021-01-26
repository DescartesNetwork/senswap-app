import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';

const EMPTY = {
  error: '',
  tokenAddress: '',
  tokenAccount: '',
  txId: ''
}

class Issuer extends Component {
  constructor() {
    super();

    this.state = {
      symbol: '',
      supply: 5000000000,
      decimals: 9,
      ...EMPTY
    }
  }

  onSymbol = (e) => {
    const symbol = e.target.value || '';
    if (symbol.length > 4) return;
    return this.setState({ symbol, ...EMPTY });
  }

  onSupply = (e) => {
    const supply = e.target.value || '';
    return this.setState({ supply, ...EMPTY });
  }

  onDecimals = (e) => {
    const decimals = parseInt(e.target.value) || '';
    return this.setState({ decimals, ...EMPTY });
  }

  onCreate = () => {
    const { symbol, supply, decimals } = this.state;
    const { wallet: { user }, getSecretKey, updateWallet } = this.props;

    let error = '';
    if (decimals < 1 || decimals > 9) error = 'Invalid decimals';
    if (symbol.length !== 4) error = 'Invalid symbol';
    if (supply < 1 || supply > 1000000000000) error = 'Invalid supply';
    if (error) return this.setState({ ...EMPTY, error });

    return getSecretKey().then(secretKey => {
      const payer = sol.fromSecretKey(secretKey);
      return sol.newToken(
        symbol.split(''),
        global.BigInt(supply) * 10n ** global.BigInt(decimals),
        decimals,
        payer
      );
    }).then(({ token, receiver, txId }) => {
      this.setState({
        ...EMPTY,
        tokenAddress: token.publicKey.toBase58(),
        tokenAccount: receiver.publicKey.toBase58(),
        txId
      });
      const tokenAccounts = [...user.tokenAccounts];
      tokenAccounts.push(receiver.publicKey.toBase58());
      return updateWallet({ ...user, tokenAccounts });
    }).catch(er => {
      return this.setState({ ...EMPTY, error: er });
    });
  }

  render() {
    const { classes } = this.props;
    const { sol: { tokenFactoryAddress } } = configs;
    const { symbol, supply, decimals, error, tokenAddress, tokenAccount, txId } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">SenIssuer</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Token Fcatory"
                    variant="outlined"
                    value={tokenFactoryAddress}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Decimals"
                    variant="outlined"
                    value={decimals}
                    onChange={this.onDecimals}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Symbol"
                    variant="outlined"
                    helperText="The symbol must include 4 characters. You can use - to replace empty characters."
                    value={symbol}
                    onChange={this.onSymbol}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Total supply"
                    variant="outlined"
                    helperText="Without decimals"
                    value={supply}
                    onChange={this.onSupply}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap} spacing={2}>
                    <Grid item className={classes.stretch}>
                      {error ? <Typography color="error">{error}</Typography> : null}
                      {tokenAddress && tokenAccount && txId ? <Typography>A new token and an account was added into your wallet!</Typography> : null}
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.onCreate}
                        endIcon={<FlightTakeoffRounded />}
                      >
                        <Typography>New</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
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
)(withStyles(styles)(Issuer)));