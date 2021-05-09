import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Brand from 'senswap-ui/brand';

import { PowerSettingsNewRounded } from 'senswap-ui/icons';

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
    const { classes, wallet: { user: { address } }, ui: { leftbar } } = this.props;

    return <Grid container spacing={0}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            {!leftbar ? <Grid container>
              <Grid item className={classes.opticalCorrectionBrand}>
                <Brand />
              </Grid>
            </Grid> : <Typography>SenSwap</Typography>}
          </Grid>
          {ssjs.isAddress(address) ? <Grid item>
            <Button
              onClick={this.disconnect}
              startIcon={<PowerSettingsNewRounded />}
            >
              <Typography>Disconnect</Typography>
            </Button>
          </Grid> : null}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4">Wallet</Typography>
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