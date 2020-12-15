import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import ListSubheader from '@material-ui/core/ListSubheader';
import MenuItem from '@material-ui/core/MenuItem';

import styles from './styles';
import sol from 'helpers/sol';
import { updateToken } from 'modules/wallet.reducer';


class List extends Component {
  constructor() {
    super();

    this.state = {
      tokensData: [],
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
      return sol.getTokenData(token);
    })).then(re => {
      return this.setState({ tokensData: re });
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
    const { wallet: { token } } = this.props;
    const { tokensData } = this.state;

    return <Select
      variant="outlined"
      value={token}
      onChange={this.onSelect}
    >
      {tokensData.map(({ initialized, address, token }) => {
        if (!initialized) return null;
        const symbol = token.symbol.join('').replace('-', '');
        const shortAddress = address.substring(0, 8) + '...';
        return [
          <ListSubheader>{symbol}</ListSubheader>,
          <MenuItem value={address}>{shortAddress}</MenuItem>
        ]
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