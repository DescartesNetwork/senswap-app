import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import styles from './styles';
import utils from 'helpers/utils';
import { updateToken } from 'modules/wallet.reducer';


class List extends Component {
  constructor() {
    super();

    this.state = {
      values: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { tokens } } = this.props;
    return Promise.all(tokens.map(token => {
      return utils.getTokenAccountData(token);
    })).then(values => {
      return this.setState({ values });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (e) => {
    const { wallet: { tokens }, updateToken } = this.props;
    const token = e.target.value;
    return updateToken(tokens, token);
  }

  render() {
    const { wallet: { tokens, token } } = this.props;
    const { values } = this.state;

    return <Select
      variant="outlined"
      value={token}
      onChange={this.onSelect}
    >
      {values.map((value, index) => {
        const address = tokens[index];
        if (!address) return null;
        const symbol = value.symbol.join('').replace('-', '');
        const shortAddress = address.substring(0, 4) + '...';
        return <MenuItem key={address} value={address}>{`${symbol} - ${shortAddress}`}</MenuItem>
      })}
    </Select>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateToken
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(List)));