import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CloseRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import SecretKey from './secretKey';
import Keystore from './keystore';
import Info from './info';

import styles from './styles';
import { closeWallet } from 'modules/wallet.reducer';


class Wallet extends Component {

  renderComponent = () => {
    const { wallet: { address } } = this.props;

    if (!address) return <Grid container spacing={2}>
      <Grid item xs={12}>
        <SecretKey />
      </Grid>
      <Grid item xs={12}>
        <Keystore />
      </Grid>
    </Grid>
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Info />
      </Grid>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { wallet: { visible }, closeWallet } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Dialog open={visible} onClose={closeWallet}>
          <DialogTitle>
            <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Wallet</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={closeWallet}>
                  <CloseRounded />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {this.renderComponent()}
              </Grid>
              <Grid item xs={12}>
                <Drain small />
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  closeWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));