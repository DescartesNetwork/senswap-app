import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

import AccountList from 'containers/wallet/components/accountList';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';


class AccountSelection extends Component {
  constructor() {
    super();

    this.state = {
      tokenAddress: '',
      data: {},
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
    const { poolAddress } = this.props;
    if (!poolAddress) return this.setState({ tokenAddress: '' });
    return sol.getPurePoolData(poolAddress).then(re => {
      if (!re) return this.setState({ tokenAddress: '' });
      const { token: { address: tokenAddress } } = re;
      return this.setState({ tokenAddress });
    }).catch(er => {
      return console.error(er);
    });
  }

  onData = (data = {}) => {
    const { onChange } = this.props;
    return this.setState({ data }, () => {
      return onChange(data);
    });
  }

  render() {
    const { classes } = this.props;
    const { label } = this.props;
    const { data: { address: accountAddress }, tokenAddress } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={label}
          variant="outlined"
          value={accountAddress || ''}
          InputProps={{
            startAdornment: <Avatar className={classes.accountIcon}>
              <Typography variant="h5">{utils.randEmoji(accountAddress)}</Typography>
            </Avatar>,
            endAdornment: <AccountList
              tokenAddress={tokenAddress}
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
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