import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

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
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  txId: ''
}

class Issuer extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      supply: 5000000000,
      decimals: 9,
    }

    this.splt = window.senwallet.splt;
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
    const { supply: refSupply, decimals: refDecimals } = this.state;
    const {
      wallet: { user, accounts },
      setError,
      unlockWallet, updateWallet
    } = this.props;

    const decimals = parseInt(refDecimals) || 0;
    const supply = parseInt(refSupply) || 0;
    if (decimals < 1 || decimals > 9) return setError('Decimals must be an integer that greater than 0, and less then 10');
    if (supply < 1 || supply > 1000000000000) return setError('Total supply must be grearer than0, and less than or equal to 1000000000000');

    const mint = ssjs.createAccount();
    const mintAddress = mint.publicKey.toBase58();
    let secretKey = null;
    let txId = null;
    let accountAddress = null;
    const totalSupply = global.BigInt(supply) * global.BigInt(10 ** decimals);
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.splt.initializeMint(decimals, null, mint, payer);
      }).then(txId => {
        return sol.newAccount(mintAddress, secretKey);
      }).then(({ address, txId }) => {
        accountAddress = address;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.splt.mintTo(totalSupply, mintAddress, accountAddress, payer);
      }).then(refTxId => {
        txId = refTxId;
        const newMints = [...user.mints];
        if (!newMints.includes(mintAddress)) newMints.push(mintAddress);
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ user: { ...user, mints: newMints }, accounts: newAccounts });
      }).then(re => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { loading, supply, decimals, txId } = this.state;

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
                    label="SPL Token Address"
                    variant="outlined"
                    value={this.splt.spltProgramId.toBase58()}
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
                    label="Supply"
                    variant="outlined"
                    helperText="Do not include decimals."
                    value={supply}
                    onChange={this.onSupply}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap} spacing={2}>
                    <Grid item className={classes.stretch}>
                      {txId ? <Typography>Success - <Link href={utils.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography> : null}
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
  updateWallet, unlockWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Issuer)));