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
import TVL from './tvl';
import Volume from './volume';
import ROI from './roi';
import Reserve from './reserve';
import Price from './price';
import Reference from './reference';
import Action from './action';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPoolData, getAccountData } from 'modules/bucket.reducer';


class Board extends Component {
  constructor() {
    super();

    this.state = {
      data: {}
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
      <Grid item xs={12} md={6}>
        <TVL poolAddress={poolAddress} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Volume poolAddress={poolAddress} />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Grid container>
          <Grid item xs={12}>
            <ROI poolAddress={poolAddress} />
          </Grid>
          <Grid item xs={12}>
            <Reserve poolData={data} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Grid container>
          <Grid item xs={12}>
            <Price poolData={data} />
          </Grid>
          <Grid item xs={12}>
            <Reference poolData={data} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={4}>
        <Action poolAddress={poolAddress} />
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
  getPoolData, getAccountData
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Board)));