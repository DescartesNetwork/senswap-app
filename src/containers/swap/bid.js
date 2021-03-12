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
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import { OfflineBoltRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import MintSelection from './mintSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData, getPoolData } from 'modules/bucket.reducer';


class Bid extends Component {
  constructor() {
    super();

    this.state = {
      value: '0',
      amount: 0,
      accountData: {},
      poolAddress: '',
      poolData: {},
      percentage: 0,
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
    const { accountData: { mint: { decimals } } } = this.state;
    const amount = ssjs.decimalize(parseFloat(value) || 0, decimals);
    return this.setState({ value, amount, percentage: 0 }, this.returnData);
  }

  onPoolAddress = (poolAddress) => {
    return this.setState({ poolAddress }, this.fetchData);
  }

  onPercentage = (e, v) => {
    const percentage = v || 0;
    const { accountData: { amount: accountAmount, mint: { decimals } } } = this.state;
    const amount = accountAmount * global.BigInt(percentage) / global.BigInt(100);
    const value = ssjs.undecimalize(amount, decimals);
    return this.setState({ percentage, amount, value }, this.returnData);
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
    const { getAccountData, setError } = this.props;
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
    const { advance } = this.props;
    const {
      value, percentage,
      accountData: { amount: accountAmount, mint },
      poolData: { address: poolAddress }
    } = this.state;

    const { decimals, symbol } = mint || {};
    const balance = utils.prettyNumber(ssjs.undecimalize(accountAmount, decimals));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={<span>Available {symbol}: <strong>{balance}</strong></span>}
          variant="outlined"
          value={value}
          onChange={this.onAmount}
          InputProps={{
            endAdornment: <ToggleButtonGroup size="small" value={percentage} onChange={this.onPercentage} exclusive>
              <ToggleButton value={25}>
                <Tooltip title="Use 25% of the available balance">
                  <Typography className={classes.subtitle}>25%</Typography>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={50}>
                <Tooltip title="Use 50% of the available balance">
                  <Typography className={classes.subtitle}>50%</Typography>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={75}>
                <Tooltip title="Use 75% of the available balance">
                  <Typography className={classes.subtitle}>75%</Typography>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={100}>
                <Tooltip title="Use 100% of the available balance">
                  <OfflineBoltRounded />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          }}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} className={classes.opticalCorrection}>
        <MintSelection onChange={this.onPoolAddress} />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <AccountSelection
            label="Source Address"
            poolAddress={poolAddress}
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

Bid.defaultProps = {
  value: 0,
  advance: false,
  onChange: () => { },
}

Bid.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  advance: PropTypes.bool,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Bid)));