import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import styles from './styles';
import sol from 'helpers/sol';
import { updatePool } from 'modules/wallet.reducer';


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
    const { wallet: { pools } } = this.props;
    return Promise.all(pools.map(pool => {
      return sol.getPoolAccountData(pool);
    })).then(values => {
      return this.setState({ values });
    }).catch(er => {
      return console.error(er);
    });
  }

  onSelect = (e) => {
    const { wallet: { pools }, updatePool } = this.props;
    const pool = e.target.value;
    return updatePool(pools, pool);
  }

  render() {
    const { wallet: { pools, pool } } = this.props;
    const { values } = this.state;

    return <Select
      variant="outlined"
      margin="dense"
      value={pool}
      onChange={this.onSelect}
    >
      {values.map((value, index) => {
        const address = pools[index];
        if (!address) return null;
        const price = (Number(value.sen) / Number(value.reserve)).toString();
        const shortAddress = address.substring(0, 4) + '...';
        return <MenuItem key={address} value={address}>{`${price} - ${shortAddress}`}</MenuItem>
      })}
    </Select>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updatePool
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(List)));