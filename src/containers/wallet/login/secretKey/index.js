import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';

import {
  VpnKeyRounded, PowerRounded, HelpRounded,
  ErrorRounded,
} from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';


class SecretKey extends Component {
  constructor() {
    super();

    this.state = {
      secretKey: '',
      password: '',
      advance: false,
    }
  }

  onAdvance = (e) => {
    const advance = e.target.checked || false;
    return this.setState({ advance });
  }

  onSecretKey = (e) => {
    const secretKey = e.target.value || '';
    return this.setState({ secretKey });
  }

  onPassword = (e) => {
    const password = e.target.value || '';
    return this.setState({ password });
  }

  onSave = () => {
    const { setError, setWallet } = this.props;
    const { secretKey, password } = this.state;
    if (!secretKey) return setError('The secret key cannot be empty');
    const keystore = ssjs.encrypt(secretKey, password);
    if (!keystore) return setError('The secret key is incorrect');
    return setWallet(keystore.publicKey, keystore);
  }

  onGen = () => {
    const account = sol.createAccount();
    const secretKey = Buffer.from(account.secretKey).toString('hex');
    return this.setState({ secretKey });
  }

  render() {
    const { classes } = this.props;
    const { secretKey, password, advance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <IconButton size="small" color="primary">
              <VpnKeyRounded />
            </IconButton>
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Secret Key</Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={0} alignItems="center" className={classes.noWrap}>
              <Grid item>
                <Tooltip title="Caution! This format is not recommended due to a lack of cryptographical protection. By switching the button, you agree that you will use this function at your own risk.">
                  <Chip
                    icon={<ErrorRounded className={classes.warning} />}
                    label="Caution!"
                    clickable
                  />
                </Tooltip>
              </Grid>
              <Grid item>
                <Switch color="primary" checked={advance} onClick={this.onAdvance} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>The secret key is a raw form of your wallet, then it's very unsecure and not recommended to use. To enhance security, SenWallet will provide you an extra protection.</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Secret Key"
                variant="outlined"
                onChange={this.onSecretKey}
                value={secretKey}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={this.onPassword}
                InputProps={{
                  endAdornment: <IconButton
                    color="primary"
                    onClick={this.onSave}
                    edge="end"
                  >
                    <PowerRounded />
                  </IconButton>
                }}
                helperText="You have to input a password to encrypt your secret key. If the software needs to sign a transaction, or related work afterwards, you will be required to input this password to unlock your wallet"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} justify="flex-end">
                <Grid item>
                  <Button onClick={this.onGen} startIcon={<HelpRounded />} fullWidth>
                    <Typography>Not have secret key yet?</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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
  setError,
  setWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SecretKey)));