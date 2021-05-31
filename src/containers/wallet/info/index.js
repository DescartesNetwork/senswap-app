import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';

import { FlightTakeoffRounded, FlightLandRounded, HistoryRounded } from 'senswap-ui/icons';

import Hidden from '@material-ui/core/Hidden';

import Price from './price';
import { AccountSelection, AccountSend, AccountReceive } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { getAccountData } from 'modules/bucket.reducer';
import { setError, setSuccess, toggleRightBar } from 'modules/ui.reducer';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      accountData: {},
      visibleAccountSelection: false,
      visibleAccountSend: false,
      visibleAccountReceive: false,
    }

    this.splt = window.senswap.splt;
    this.lamports = window.senswap.lamports;
  }

  onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });
  onOpenAccountSelection = () => this.setState({ visibleAccountSelection: true });
  onAccountData = (accountData) => {
    return this.setState({ accountData }, () => {
      this.onOpenAccountSend();
      return this.onCloseAccountSelection();
    });
  }

  onCloseAccountSend = () => this.setState({ visibleAccountSend: false });
  onOpenAccountSend = () => this.setState({ visibleAccountSend: true });
  onTransactionData = async ({ amount, from, to }) => {
    const { setError, setSuccess, getAccountData } = this.props;
    if (!ssjs.isAddress(to)) return setError('Invalid destination address');

    // Transfer lamports
    if (!ssjs.isAddress(from)) {
      const txId = await this.lamports.transfer(amount, to, window.senswap.wallet);
      await setSuccess('Transfer successfully', utils.explorer(txId));
      return this.onCloseAccountSend();
    }

    // Validate source address
    let mintAddress = null;
    try {
      const { mint } = await getAccountData(from) || {};
      const { address } = mint || {};
      if (!ssjs.isAddress(address)) return setError('Invalid source address');
      mintAddress = address;
    } catch (er) {
      return setError(er);
    }
    // Check type of destination either wallet address or account address
    try {
      const { address: accountAddress } = await getAccountData(to);
      if (!ssjs.isAddress(accountAddress)) throw new Error('The destination is wallet address');
    } catch (er) {
      try {
        const { address: dstAddress } = await sol.newAccount(mintAddress, to);
        to = dstAddress;
      } catch (er) {
        return setError(er);
      }
    }
    // Transfer token
    try {
      const txId = await this.splt.transfer(amount, from, to, window.senswap.wallet);
      await setSuccess('Transfer successfully', utils.explorer(txId));
    } catch (er) {
      await setError(er);
    }
    return this.onCloseAccountSend();
  }

  onCloseAccountReceive = () => this.setState({ visibleAccountReceive: false });
  onOpenAccountReceive = () => this.setState({ visibleAccountReceive: true });

  render() {
    const { classes, toggleRightBar } = this.props;
    const { accountData, visibleAccountSelection, visibleAccountSend, visibleAccountReceive } = this.state;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Grid container className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Total Balance</Typography>
            </Grid>
            <Grid item>
              <Button startIcon={<HistoryRounded color="disabled" />} onClick={toggleRightBar}>
                <Typography variant="body2" color="textSecondary">History</Typography>
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Price />
        </Grid>
        <Hidden mdUp>
          <Grid item xs={12}>
            <Drain size={2} />
          </Grid>
        </Hidden>
        <Grid item xs={12} md={6}>
          <Grid container justify="flex-end" className={classes.noWrap}>
            <Grid item xs={6} md='auto'>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FlightTakeoffRounded />}
                size="large"
                onClick={this.onOpenAccountSelection}
                fullWidth
              >
                <Typography>Send</Typography>
              </Button>
            </Grid>
            <Grid item xs={6} md='auto'>
              <Button
                variant="outlined"
                startIcon={<FlightLandRounded />}
                size="large"
                onClick={this.onOpenAccountReceive}
                fullWidth
              >
                <Typography>Receive</Typography>
              </Button>
            </Grid>
            <AccountSelection
              visible={visibleAccountSelection}
              onClose={this.onCloseAccountSelection}
              onChange={this.onAccountData}
            />
            <AccountSend
              visible={visibleAccountSend}
              data={accountData}
              onClose={this.onCloseAccountSend}
              onSend={this.onTransactionData}
            />
            <AccountReceive
              visible={visibleAccountReceive}
              data={accountData}
              onClose={this.onCloseAccountReceive}
            />
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getAccountData,
  setError, setSuccess, toggleRightBar,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));