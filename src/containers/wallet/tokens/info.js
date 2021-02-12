import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';

import AccountList from 'containers/wallet/components/accountList';
import AccountAvatar from 'containers/wallet/components/accountAvatar';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { setQRCode, setMainAccount } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class TokenInfo extends Component {
  constructor() {
    super();

    this.state = {
      accountAddress: '',
      data: {},
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    const { bucket: prevBucket } = prevProps;
    const { bucket } = this.props;
    const { accountAddress: prevAccountAddress } = prevState;
    const { accountAddress } = this.state;
    if (!isEqual(bucket, prevBucket) || !isEqual(accountAddress, prevAccountAddress)) this.fetchData();
  }

  fetchData = () => {
    const { setError, getAccountData } = this.props;
    const { accountAddress } = this.state;
    if (!ssjs.isAddress(accountAddress)) return this.setState({ accountAddress: '', data: {} });
    return getAccountData(accountAddress).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onQRCode = () => {
    const { data: { address } } = this.state;
    const { setQRCode } = this.props;
    return setQRCode(true, address);
  }

  onAddress = (accountAddress) => {
    return this.setState({ accountAddress });
  }

  render() {
    const { classes } = this.props;
    const { data: { address, amount, initialized, token } } = this.state;
    const symbol = initialized ? ssjs.toSymbol(token.symbol) : 'UNKOWN';
    const balance = initialized ? utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals))) : 0;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4">{balance} {symbol}</Typography>
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
            <AccountList onChange={this.onAddress} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  setQRCode, setMainAccount,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TokenInfo)));