import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import AccountList from './accountList';
import { AccountAvatar } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class AccountSelection extends Component {
  constructor() {
    super();

    this.state = {
      mintAddress: '',
      accountData: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolAddress: prevPoolAddress } = prevProps;
    const { poolAddress } = this.props;
    if (!isEqual(poolAddress, prevPoolAddress)) this.fetchData();
  }

  fetchData = () => {
    const { poolAddress, getPoolData } = this.props;
    if (!poolAddress) return this.setState({ mintAddress: '' });
    return getPoolData(poolAddress).then(re => {
      if (!re) return this.setState({ mintAddress: '' });
      const { mint: { address: mintAddress } } = re;
      return this.setState({ mintAddress });
    }).catch(er => {
      return setError(er);
    });
  }

  onData = (accountData = {}) => {
    const { onChange } = this.props;
    return this.setState({ accountData }, () => {
      const { address: accountAddress } = accountData;
      return onChange(accountAddress);
    });
  }

  render() {
    // const { classes } = this.props;
    const { label } = this.props;
    const { accountData: { address, mint }, mintAddress } = this.state;
    const { icon } = mint || {};

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={label}
          variant="outlined"
          value={address || ''}
          InputProps={{
            startAdornment: <AccountAvatar address={address} icon={icon} marginRight />,
            endAdornment: <AccountList
              mintAddress={mintAddress}
              size="medium"
              onChange={this.onData}
              edge="end"
            />,
            readOnly: true
          }}
          fullWidth
        />
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
  getPoolData,
}, dispatch);

AccountSelection.defaultProps = {
  label: 'Address',
  poolAddress: '',
  onChange: () => { },
}

AccountSelection.propTypes = {
  label: PropTypes.string,
  poolAddress: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AccountSelection)));