import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { CardPool } from 'senswap-ui/card';

import { } from 'senswap-ui/icons';

import AddLiquidity from '../addLiquidity';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class LatestPromotion extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      poolData: {},
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { setError, getPools, getPool, getPoolData } = this.props;
    return getPools({}, 9, 0).then(poolIds => {
      return poolIds.each(({ _id }) => getPool(_id), { skipError: true, skipIndex: true });
    }).then(data => {
      return data.each(({ address }) => getPoolData(address), { skipError: true, skipIndex: true });
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onOpen = (i) => {
    const { data } = this.state;
    const poolData = { ...data[i] }
    return this.setState({ poolData, visible: true });
  }

  onClose = () => {
    return this.setState({ poolData: {}, visible: false });
  }

  render() {
    // const { classes } = this.props;
    const { poolData, visible, data } = this.state;

    return <Grid container spacing={2}>
      {data.map((poolData, i) => {
        const {
          mint_s: { icon: iconS, symbol: symbolS },
          mint_a: { icon: iconA, symbol: symbolA },
          mint_b: { icon: iconB, symbol: symbolB },
        } = poolData;
        const icons = [iconA, iconB, iconS];
        const symbols = [symbolA, symbolB, symbolS];
        return <Grid item key={i} xs={12} md={6} lg={4}>
          <CardPool
            icons={icons}
            symbols={symbols}
            onDeposit={() => this.onOpen(i)}
          />
        </Grid>
      })}
      <AddLiquidity data={poolData} visible={visible} onClose={this.onClose} />
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
  getPools, getPool,
  getPoolData
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LatestPromotion)));