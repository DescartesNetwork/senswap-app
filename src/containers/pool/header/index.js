import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';

import { QueueRounded, InputRounded, LaunchRounded } from 'senswap-ui/icons';

import WalletButton from 'containers/wallet/components/walletButton';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { unsetWallet } from 'modules/wallet.reducer';


class Wallet extends Component {

  disconnect = () => {
    const { setError, unsetWallet } = this.props;
    return unsetWallet().then(re => {
      // Nothing
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { address } } } = this.props;

    return <Grid container spacing={0}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography>SenSwap</Typography>
          </Grid>
          {address ? <Grid item>
            <WalletButton />
          </Grid> : null}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" spacing={3}>
          <Grid item>
            <Typography variant="h4">Pools</Typography>
          </Grid>
          {!address ? <Grid item>
            <WalletButton />
          </Grid> : <Fragment>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QueueRounded />}
              >
                <Typography>New Pool</Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button
                startIcon={<InputRounded />}
              >
                <Typography>Deposit</Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button
                startIcon={<LaunchRounded />}
              >
                <Typography>Withdraw</Typography>
              </Button>
            </Grid>
          </Fragment>}
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
  unsetWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));