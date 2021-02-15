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
import TokenSelection from './tokenSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class Ask extends Component {
  constructor() {
    super();

    this.state = {
      accountAddress: '',
      value: '0',
      amount: 0,
      poolAddress: '',
      poolData: {},
    }

    this.swap = window.senwallet.swap;
  }

  componentDidUpdate(prevProps) {
    const { bucket: prevBucket, amount: prevAmount } = prevProps;
    const { bucket, amount } = this.props;
    if (!isEqual(amount, prevAmount)) {
      const pseudoEvent = { target: { value: amount.toString() } }
      this.onAmount(pseudoEvent);
    }
    if (!isEqual(bucket, prevBucket)) this.fetchData();
  }

  onAmount = (e) => {
    const value = e.target.value || '';
    const amount = parseFloat(value) || 0;
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
      return this.setState({ poolData: { ...data } }, this.returnData);
    }).catch(er => {
      return setError(er);
    });
  }

  onAccountAddress = (accountAddress) => {
    return this.setState({ accountAddress }, this.returnData);
  }

  returnData = () => {
    const { amount, poolData, accountAddress } = this.state;
    const { onChange } = this.props;
    return onChange({ amount, poolData, accountAddress });
  }

  render() {
    const { classes } = this.props;
    const { advance } = this.props;
    const { value, poolData: { address } } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="To"
          variant="outlined"
          value={value}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} className={classes.opticalCorrection}>
        <TokenSelection onChange={this.onPoolAddress} />
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
  getPoolData,
}, dispatch);

Ask.defaultProps = {
  amount: 0,
  advance: false,
  onChange: () => { },
}

Ask.propTypes = {
  amount: PropTypes.number,
  advance: PropTypes.bool,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Ask)));