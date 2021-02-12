import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { ExploreRounded } from '@material-ui/icons';

import AccountAvatar from 'containers/wallet/components/accountAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { setQRCode } from 'modules/wallet.reducer';


class PayerInfo extends Component {
  constructor() {
    super();

    this.state = {
      amount: 0,
    }

    this.src20 = window.senwallet.src20;
  }

  componentDidMount() {
    this.fetchData();
    this.watch();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: { address: prevAddress } } } = prevProps;
    const { wallet: { user: { address } } } = this.props;
    if (!isEqual(address, prevAddress)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { address } }, setError } = this.props;
    return this.src20.getLamports(address).then(re => {
      return this.setState({ amount: re / LAMPORTS_PER_SOL });
    }).catch(er => {
      return setError(er);
    });
  }

  watch = () => {
    const { wallet: { user: { address } } } = this.props;
    return this.src20.connection.onAccountChange(
      ssjs.fromAddress(address),
      this.fetchData
    );
  }

  onQRCode = () => {
    const { wallet: { user: { address } } } = this.props;
    const { setQRCode } = this.props;
    return setQRCode(true, address);
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { address } } } = this.props;
    const { amount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{utils.prettyNumber(Number(amount))} SOL</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <AccountAvatar title="QR Code" address={address} onClick={this.onQRCode} />
          </Grid>
          <Grid item className={classes.stretch}>
            <InputBase
              placeholder='Receiver'
              value={address || ''}
              fullWidth
              readOnly
            />
          </Grid>
          <Grid item>
            <Tooltip title="View on explorer">
              <IconButton
                color="secondary"
                size="small"
                href={utils.explorer(address)}
                target="_blank"
                rel="noopener"
              >
                <ExploreRounded />
              </IconButton>
            </Tooltip>
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
  setError,
  setQRCode,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerInfo)));