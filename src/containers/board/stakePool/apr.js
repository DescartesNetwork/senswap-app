import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import numeral from 'numeral';
import ssjs from 'senswapjs';

import Grid from 'senswap-ui/grid';
import Chart from 'components/chart';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';

import farm from 'helpers/farm';
import styles from './styles';
import { getBoardFarmingAprs } from 'modules/board.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getStakePoolData } from 'modules/bucket.reducer';


class AprFarming extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
      labels: [],
      total_harvest: 0,
    }
  }

  componentDidMount() {
    this.fecthAprData();
  }

  fecthAprData = async () => {
    const { getBoardFarmingAprs } = this.props;
    this.setState({ loading: true, isFetchData: false });
    try {
      const address = await this.getStakepoolAddress();
      const res = await getBoardFarmingAprs({}, address);
      const data = res.map(e => e.roi);
      const labels = res.map(e => e.time % 100);
      this.setState({ data: data, labels: labels });
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ loading: false });
    }
  }

  getStakepoolAddress = async () => {
    const {
      getStakePoolData, getStakePools,
      poolData: { mint_lpt: { address: mintAddress } }
    } = this.props;
    if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
    try {
      let poolAddresses = await getStakePools({}, 9999);
      const promise = poolAddresses.map(({ address }) => {
        return getStakePoolData(address);
      });
      const stakePools = await Promise.all(promise);
      const stakePoolAddress = farm.getStakePoolAddress({ stakePools, mintAddress });
      return stakePoolAddress;
    } catch (err) {
      console.log(err, 'err');
    }
  }

  render() {
    const { classes } = this.props;
    const { loading, data, labels: times } = this.state;
    const styles = {
      backgroundColor: '#883636',
      borderColor: '#883636',
      borderRadius: 0,
    }
    if (loading) return <Skeleton variant="rect" height={320} className={classes.paper} />
    if (!data || data.length < 1) return null;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">APR Yeild farming</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item>
              <Typography color="textSecondary">APR: </Typography>
            </Grid>
            <Grid item >
              <Typography>{data ? numeral(data[data.length - 1]).format('0.[00]') : 0}%</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Chart data={data} labels={times} type="line" styles={styles} fill={true} tension="0.4" pointRadius="0" />
        </Grid>
      </Grid>
    </Paper>
  }
}
const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});
const mapDispatchToProps = dispatch => bindActionCreators({
  getStakePoolData, getStakePools, getBoardFarmingAprs
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(withStyles(styles)(AprFarming)));