import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';

import { PowerRounded } from '@material-ui/icons';

import styles from './styles';
import COIN98_LOGO from 'static/images/coin98-logo.png';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';


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
        <Typography>Coin98 Wallet Extension is a variant of Coin98 Wallet for Chrome extension. You can <Link href="https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg?hl=en" target="_blank" rel="noopener">click here to install.</Link></Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Accounts"
          variant="outlined"
          value={mainAccount}
          InputProps={{
            endAdornment: <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={this.connect}
                startIcon={<PowerRounded />}
              >
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