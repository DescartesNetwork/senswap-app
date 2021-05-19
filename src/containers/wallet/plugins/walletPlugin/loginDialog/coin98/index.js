import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { Coin98Wallet } from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Avatar from 'senswap-ui/avatar';
import Link from 'senswap-ui/link';
import CircularProgress from 'senswap-ui/circularProgress';

import { PowerRounded } from 'senswap-ui/icons';

import styles from './styles';
import COIN98_LOGO from 'static/images/coin98-logo.png';
import { setError } from 'modules/ui.reducer';
import { setWallet } from 'modules/wallet.reducer';


class Coin98 extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
    }
  }

  connect = async () => {
    const { setError, setWallet } = this.props;
    const { coin98 } = window;
    if (!coin98) return setError('Coin98 Wallet is not installed. If this is the first time you install Coin98 wallet, please restart your browser to finish the setup.');
    this.setState({ loading: true });
    const wallet = new Coin98Wallet();
    try {
      await setWallet(wallet);
    } catch (er) {
      setError(er);
    }
    return this.setState({ loading: false });
  }

  render() {
    const { classes } = this.props;
    const { loading } = this.state;

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
        <Button
          variant="contained"
          color="primary"
          onClick={this.connect}
          size="large"
          startIcon={loading ? <CircularProgress size={17} /> : <PowerRounded />}
          disabled={loading}
          fullWidth
        >
          <Typography>Connect Coin98 Wallet</Typography>
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
)(withStyles(styles)(Coin98)));