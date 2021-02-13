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
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';

import { } from '@material-ui/icons';

import TokenSelection from './tokenSelection';
import AccountSelection from 'containers/wallet/components/accountSelection';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class Ask extends Component {
  constructor() {
    super();

    this.state = {
      accountAddress: '',
      amount: 0,
      poolAddress: '',
      poolData: {},
    }

    this.swap = window.senwallet.swap;
  }

  componentDidUpdate(prevProps, prevState) {
    const { bucket: prevBucket, amount: prevAmount } = prevProps;
    const { bucket, amount } = this.props;
    const { poolAddress: prevPoolAddress } = prevState;
    const { poolAddress } = this.state;
    if (!isEqual(amount, prevAmount)) {
      const pseudoEvent = { target: { value: amount } }
      this.onAmount(pseudoEvent);
    }
    if (!isEqual(bucket, prevBucket) || !isEqual(poolAddress, prevPoolAddress)) {
      this.fetchData();
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount }, this.returnData);
  }

  onPoolAddress = (poolAddress) => {
    return this.setState({ poolAddress });
  }

  fetchData = () => {
    const { setError, getPoolData } = this.props;
    const { poolAddress } = this.state;
    if (!ssjs.isAddress(poolAddress)) return this.setState({ poolData: {} }, this.returnData);
    return getPoolData(poolAddress).then(poolData => {
      return this.setState({ poolData }, this.returnData);
    }).catch(er => {
      return setError(er);
    });
  }

  onAccountAddress = (accountAddress) => {
    return this.setState({ accountAddress });
  }

  returnData = () => {
    const { amount, poolData, accountAddress } = this.state;
    const { onChange } = this.props;
    return onChange({ amount, poolData, accountAddress });
  }

  render() {
    const { classes } = this.props;
    const { advance } = this.props;
    const { amount, poolData: { address, reserve, lpt } } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            <Typography variant="h6">To</Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.price}>Price: ${utils.prettyNumber(utils.div(lpt, reserve))}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <TokenSelection onChange={this.onPoolAddress} />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Ask Amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <AccountSelection
            label="Destination Address"
            poolAddress={address}
            onChange={this.onAccountAddress}
          />
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