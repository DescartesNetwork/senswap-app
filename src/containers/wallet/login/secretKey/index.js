import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import { VpnKeyRounded, PowerRounded, HelpRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { setWallet } from 'modules/wallet.reducer';


class SecretKey extends Component {
  constructor() {
    super();

    this.state = {
      secretKey: ''
    }
  }

  onSecretKey = (e) => {
    const secretKey = e.target.value || '';
    return this.setState({ secretKey });
  }

  onSave = () => {
    const { setWallet } = this.props;
    const { secretKey } = this.state;
    if (!secretKey) return console.error('Invalid secret key');
    const account = sol.fromSecretKey(secretKey);
    const address = account.publicKey.toBase58()
    return setWallet(address, secretKey);
  }

  gen = () => {
    const account = sol.createAccount();
    const secretKey = Buffer.from(account.secretKey).toString('hex');
    return this.setState({ secretKey });
  }

  render() {
    const { classes } = this.props;
    const { secretKey } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <VpnKeyRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Secret Key</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>Connect wallet using your Secret key. If you don't have one, you could create a secret key. However, make sure that you copy and securely save the secret key down. We do not store your secrets due to security and privacy.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Secret Key"
          variant="outlined"
          onChange={this.onSecretKey}
          value={secretKey}
          InputProps={{
            endAdornment: <IconButton
              color="primary"
              onClick={this.onSave}
              edge="end"
            >
              <PowerRounded />
            </IconButton>
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} justify="flex-end">
          <Grid item>
            <Button
              onClick={this.gen}
              startIcon={<HelpRounded />}
              fullWidth
            >
              <Typography>Not have secret key yet?</Typography>
            </Button>
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
  setWallet
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SecretKey)));