import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs, { SecretKeyWallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';

import { VpnKeyRounded, PowerRounded } from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';


class SecretKey extends Component {
  constructor() {
    super();

    this.state = {
      secretKey: '',
    }
  }

  onSecretKey = (e) => {
    const secretKey = e.target.value || '';
    return this.setState({ secretKey });
  }

  connect = () => {
    const { setError, setWallet } = this.props;
    const { secretKey } = this.state;
    if (!secretKey) return setError('The secret key cannot be empty');
    const wallet = new SecretKeyWallet(secretKey);
    return setWallet(wallet).then(re => {
      // Do nothing
    }).catch(er => {
      return setError(er);
    });
  }

  onGen = () => {
    const account = ssjs.createAccount();
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
            <IconButton size="small">
              <VpnKeyRounded />
            </IconButton>
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Secret Key</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>The secret key is a raw form of your wallet, then it's very unsecure and not recommended to use.</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Secret Key"
          variant="contained"
          onChange={this.onSecretKey}
          value={secretKey}
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
      <Grid item className={classes.help}>
        <Button color="primary" onClick={this.onGen} fullWidth>
          <Typography>Not have secret key yet?</Typography>
        </Button>
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