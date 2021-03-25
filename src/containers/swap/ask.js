import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Collapse from '@material-ui/core/Collapse';

import Drain from 'components/drain';
import MintSelection from './mintSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData, getPoolData } from 'modules/bucket.reducer';


class Ask extends Component {
  constructor() {
    super();

    this.state = {
      value: '0',
      amount: 0,
      accountData: {},
      poolAddress: '',
      poolData: {},
    }

    this.swap = window.senwallet.swap;
  }

  componentDidUpdate(prevProps) {
    const { bucket: prevBucket, value: prevValue } = prevProps;
    const { bucket, value } = this.props;
    if (!isEqual(value, prevValue)) this.setState({ value });
    if (!isEqual(bucket, prevBucket)) this.fetchData();
  }

  onAmount = (e) => {
    const value = e.target.value || '';
    const { accountData: { mint } } = this.state;
    const { decimals } = mint || {}
    const amount = ssjs.decimalize(parseFloat(value) || 0, decimals);
    return this.setState({ value, amount }, this.returnData);
  }

  onPoolAddress = (poolAddress) => {
    return this.setState({ poolAddress }, this.fetchData);
  }

  fetchData = () => {
    const { setError, getPoolData } = this.props;
    const { poolAddress } = this.state;
    if (!ssjs.isAddress(poolAddress)) return this.setState({ poolData: {} }, this.returnData);
    return getPoolData(poolAddress).then(data => {
      return this.setState({ poolData: { ...data } }, () => {
        const { accountData: { address: accountAddress } } = this.state;
        if (!ssjs.isAddress(accountAddress)) return this.returnData();
        return this.onAccountAddress(accountAddress);
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onAccountAddress = (accountAddress) => {
    const { getAccountData, setError } = this.props;
    if (!ssjs.isAddress(accountAddress)) return;
    return getAccountData(accountAddress).then(accountData => {
      return this.setState({ accountData }, this.returnData);
    }).catch(er => {
      return setError(er);
    });
  }

  returnData = () => {
    const { onChange } = this.props;
    const { amount, poolData, accountData: { address: accountAddress } } = this.state;
    return onChange({ amount, poolData, accountAddress });
  }

  render() {
    const { classes } = this.props;
    const { ui: { advance } } = this.props;
    const {
      value,
      accountData: { amount: accountAmount, mint },
      poolData: { address }
    } = this.state;

    const { decimals, symbol } = mint || {};
    const balance = utils.prettyNumber(ssjs.undecimalize(accountAmount, decimals));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={<span>To / Available {symbol}: <strong>{balance}</strong></span>}
          variant="outlined"
          value={value}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} className={classes.opticalCorrection}>
        <MintSelection onChange={this.onPoolAddress} />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <AccountSelection
            label="Destination Address"
            poolAddress={address}
            onChange={this.onAccountAddress}
          />
          <Drain small />
        </Collapse>
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
  updateWallet,
  getAccountData, getPoolData,
}, dispatch);

Ask.defaultProps = {
  value: 0,
  onChange: () => { },
}

Ask.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Ask)));