import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import { VpnKeyRounded, PowerRounded } from '@material-ui/icons';

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
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Secret Key"
          variant="outlined"
          onChange={this.onSecretKey}
          value={secretKey}
          InputProps={{
            endAdornment: <IconButton color="primary" onClick={this.onSave}>
              <PowerRounded />
            </IconButton>
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
  setWallet
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SecretKey)));