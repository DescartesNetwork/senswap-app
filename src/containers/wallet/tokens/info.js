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
      data: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate = (prevProps) => {
    const { bucket: prevBucket, wallet: { mainAccount: prevMainAccount } } = prevProps;
    const { bucket, wallet: { mainAccount } } = this.props;
    if (!isEqual(bucket, prevBucket) || !isEqual(mainAccount, prevMainAccount)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { mainAccount }, setError, getAccountData } = this.props;
    if (!ssjs.isAddress(mainAccount)) return this.setState({ data: {} });
    return getAccountData(mainAccount).then(data => {
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
    const { setMainAccount } = this.props;
    return setMainAccount(accountAddress);
  }

  render() {
    const { classes } = this.props;
    const { data: { address, amount, state, mint } } = this.state;
    const symbol = state > 0 ? ssjs.toSymbol(mint.symbol) : 'UNKOWN';
    const balance = state > 0 ? utils.prettyNumber(utils.div(amount, global.BigInt(10 ** mint.decimals))) : 0;

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
              placeholder='No data'
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