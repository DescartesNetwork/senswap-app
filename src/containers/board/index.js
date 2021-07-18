import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';

import Header from './header';
import LPT from './lpt';
import Balance from './balance';
import TVL from './tvl';
import Volume from './volume';
import ROI from './roi';
import Reserve from './reserve';
import Price from './price';
import Reference from './reference';
import StakePool from './stakePool';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPoolData, getAccountData } from 'modules/bucket.reducer';


class Board extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
      chartData: [],
      labels: [],
      info: {},
      isLoading: false,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { lpts: prevLPTs } } = prevProps;
    const { wallet: { lpts } } = this.props;
    if (!isEqual(prevLPTs, lpts)) this.fetchData();
  }

  fetchData = async () => {
    const { match: { params: { poolAddress } }, getPoolData, setError } = this.props;
    try {
      const data = await getPoolData(poolAddress);
      return this.setState({ data });
    } catch (er) {
      return setError(er);
    }
  }

  render() {
    const { wallet: { user: { address: walletAddress } } } = this.props;
    const { data } = this.state;
    const { address: poolAddress } = data;

    if (!ssjs.isAddress(poolAddress)) return null;
    return <Grid container>
      <BucketWatcher addresses={[poolAddress]} onChange={this.fetchData} />
      <Grid item xs={12}>
        <Header poolData={data} />
      </Grid>
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      {ssjs.isAddress(walletAddress) ? <Grid item xs={12} md={6}>
        <LPT poolData={data} />
      </Grid> : null}
      {ssjs.isAddress(walletAddress) ? <Grid item xs={12} md={6}>
        <Balance poolData={data} />
      </Grid> : null}
      <Grid item xs={12} md={6}>
        <TVL poolAddress={poolAddress} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Volume poolAddress={poolAddress} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ROI poolAddress={poolAddress} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Price poolData={data} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Reserve poolData={data} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Reference poolData={data} />
      </Grid>
      {/* Farming */}
      {ssjs.isAddress(walletAddress) ? <Grid item xs={12} sm={8} md={8}>
        <StakePool poolData={data} />
      </Grid> : null}
      <Grid item xs={12}>
        <Drain size={1} />
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
  getPoolData, getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Board)));
