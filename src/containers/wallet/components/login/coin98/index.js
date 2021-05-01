import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

// import {
//   Connection, Transaction, SystemProgram,
// } from '@solana/web3.js';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import Avatar from 'senswap-ui/avatar';
import Link from 'senswap-ui/link';

import { PowerRounded } from 'senswap-ui/icons';

import styles from './styles';
import COIN98_LOGO from 'static/images/coin98-logo.png';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';

// const connection = new Connection('https://devnet.solana.com', 'recent');
// const wallet = new Coin98Wallet();
// let recentBlockhash = '';
// let txId = ''
// return connection.getRecentBlockhash('recent').then(({ blockhash }) => {
//   recentBlockhash = blockhash;
//   return wallet.getAccount();
// }).then(address => {
//   const publicKey = ssjs.fromAddress(address);
//   const instruction = SystemProgram.transfer({
//     fromPubkey: publicKey,
//     toPubkey: publicKey,
//     lamports: 1000
//   });
//   const transaction = new Transaction();
//   transaction.add(instruction);
//   transaction.recentBlockhash = recentBlockhash;
//   return wallet.sign(transaction);
// }).then(({ transaction }) => {
//   const tx = transaction.serialize();
//   return connection.sendRawTransaction(tx, { skipPreflight: true, commitment: 'recent' });
// }).then(signature => {
//   txId = signature;
//   return connection.confirmTransaction(txId, 'recent');
// }).then(re => {
//   console.log(txId)
// }).catch(er => {
//   console.log(er);
// });


class Coin98 extends Component {
  constructor() {
    super();

    this.state = {
      mainAccount: '',
    }
  }

  connect = () => {
    const { setError } = this.props;
    const { mainAccount } = this.props;
    const { coin98 } = window;
    if (!coin98) return setError('Coin98 Wallet is not installed');
    const { sol } = coin98;
    if (!sol) return setError('The current blockchain is not Solana');
    return sol.request({ method: 'sol_accounts' }).then(([account]) => {
      if (!account) return setError('There is no Solana account');
      if (!mainAccount) return this.setState({ mainAccount: account });
      // Connect wallet
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { mainAccount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <Avatar src={COIN98_LOGO} className={classes.avatar} />
          </Grid>
          <Grid item>
            <Typography variant="h6">Coin98 Wallet</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>Coin98 Wallet Extension is a variant of Coin98 Wallet for Chrome extension. You can <Link color="primary" href="https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg?hl=en" target="_blank" rel="noopener">click here to install.</Link></Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          placeholder="Accounts"
          variant="contained"
          value={mainAccount}
          InputProps={{
            endAdornment: <Grid item>
              <Button onClick={this.connect} startIcon={<PowerRounded />}>
                <Typography>Connect</Typography>
              </Button>
            </Grid>
          }}
          fullWidth
        />
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
  setWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Coin98)));