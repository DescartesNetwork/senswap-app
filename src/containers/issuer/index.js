import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';

import { FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  tokenAddress: '',
  accountAddress: '',
  txId: ''
}

class Issuer extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      symbol: '',
      supply: 5000000000,
      decimals: 9,
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
    const decimals = e.target.value || '';
    return this.setState({ decimals, ...EMPTY });
  }

  onCreate = () => {
    const { symbol: refSymbol, supply: refSupply, decimals: refDecimals } = this.state;
    const { wallet: { user }, setError, getSecretKey, updateWallet } = this.props;

    const decimals = parseInt(refDecimals) || 0;
    const supply = parseInt(refSupply) || 0;
    if (decimals < 1 || decimals > 9) return setError('Decimals must be an integer that greater than 0, and less then 10');
    if (refSymbol.length !== 4) return setError('Symbol must include 4 characters');
    if (supply < 1 || supply > 1000000000000) return setError('Total supply must be grearer than0, and less than or equal to 1000000000000');

    const symbol = refSymbol.split('');
    const totalSupply = global.BigInt(supply) * global.BigInt(10 ** decimals);
    return this.setState({ loading: true }, () => {
      return getSecretKey().then(secretKey => {
        const payer = sol.fromSecretKey(secretKey);
        return sol.newToken(symbol, totalSupply, decimals, payer);
      }).then(({ token, receiver, txId }) => {
        return this.setState({
          ...EMPTY,
          tokenAddress: token.publicKey.toBase58(),
          accountAddress: receiver.publicKey.toBase58(),
          txId
        }, () => {
          const tokenAccounts = [...user.tokenAccounts];
          tokenAccounts.push(receiver.publicKey.toBase58());
          return updateWallet({ ...user, tokenAccounts });
        });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { sol: { tokenFactoryAddress } } = configs;
    const { loading, symbol, supply, decimals, txId } = this.state;

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
                <Grid item xs={12}>
                  <TextField
                    label="Token Fcatory"
                    variant="outlined"
                    value={tokenFactoryAddress}
                    inputProps={{ readOnly: true }}
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
                    label="Total supply"
                    variant="outlined"
                    helperText="Do not include decimals."
                    value={supply}
                    onChange={this.onSupply}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Symbol"
                    variant="outlined"
                    helperText="The symbol must include 4 characters. You can use - to replace empty characters."
                    value={symbol}
                    onChange={this.onSymbol}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap} spacing={2}>
                    <Grid item className={classes.stretch}>
                      {txId ? <Typography>Success - <Link href={configs.sol.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography> : null}
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.onCreate}
                        endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
                        disabled={loading}
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
  setError,
  updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Issuer)));