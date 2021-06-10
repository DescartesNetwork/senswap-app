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
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPoolData, getAccountData } from 'modules/bucket.reducer';
import { getBoardDaily, getBoardStat } from 'modules/board.reducer';


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
    this.setState({ isLoading: true });
    this.fetchData();
    this.getDaily();
    this.getStat();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { lpts: prevLPTs } } = prevProps;
    const { wallet: { lpts } } = this.props;
    const { match: { params: { poolAddress: prevAddress } } } = prevProps;
    const { board: { stat: items } } = this.props;

    if (!isEqual(prevLPTs, lpts)) this.fetchData();

    if (items && !isEqual(prevAddress, items.pool)) {
      this.getDaily(true);
      this.getStat(true);
    }
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


  getDaily = async (force = false) => {
    const { getBoardDaily, match: { params: { poolAddress } } } = this.props;
    try {
      const data = await getBoardDaily(poolAddress, force);
      if (data) {
        const labels = data.map(e => e.time % 100);
        this.setState({ chartData: data });
        this.setState({ labels: labels });
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, 800);
      }
    } catch (err) {
      return setError(err);
    }
  }

  getStat = async (force = false) => {
    const { getBoardStat, match: { params: { poolAddress } } } = this.props;
    try {
      const data = await getBoardStat(poolAddress, force);
      if (data) this.setState({ info: data });
    } catch (err) {
      return setError(err);
    }
  }

  render() {
    const { wallet: { user: { address: walletAddress } } } = this.props;
    const { data, chartData, info, labels, isLoading } = this.state;
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
        <TVL poolAddress={poolAddress} data={chartData.map(e => e.tvl)} info={info} labels={labels} loading={isLoading} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Volume poolAddress={poolAddress} data={chartData.map(e => e.volume)} info={info} labels={labels} loading={isLoading} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <ROI poolAddress={poolAddress} info={info} />
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
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
  board: state.board,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPoolData, getAccountData,
  getBoardDaily, getBoardStat,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Board)));