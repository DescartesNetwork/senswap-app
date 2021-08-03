import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import CircularProgress from 'senswap-ui/circularProgress';

import { PoolCard } from 'containers/pool';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class MyPool extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.fetchData();
  }

  fetchData = async () => {
    const { wallet: { lpts }, getAccountData } = this.props;
    this.setState({ loading: true });
    let data = [];
    for (let lptAddress of lpts) {
      try {
        const accountData = await getAccountData(lptAddress);
        const { pool: poolData } = accountData || {}
        const { address: poolAddress } = poolData || {}
        if (!ssjs.isAddress(poolAddress)) continue;
        data.push(poolData);
        this.setState({ data: [...data] });
      } catch (er) {
        // Nothing
      }
    }
    return this.setState({ loading: false });
  }

  render() {
    const { loading, data } = this.state;

    return <Grid container spacing={2}>
      {data.map(({ address: poolAddress }, i) => <PoolCard poolAddress={poolAddress} key={i} />)}
      {loading ? <Grid item xs={12}>
        <Grid container justify="center">
          <Grid item>
            <CircularProgress size={17} />
          </Grid>
        </Grid>
      </Grid> : null}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(MyPool)));