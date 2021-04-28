import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
// import Button from 'senswap-ui/button';

// import { PowerSettingsNewRounded } from 'senswap-ui/icons';

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
    // const { wallet: { user: { address } } } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h4">Wallet</Typography>
          </Grid>
          {/* {address ? <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.disconnect}
              startIcon={<PowerSettingsNewRounded />}
              fullWidth
            >
              <Typography>Disconnect</Typography>
            </Button>
          </Grid> : null} */}
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