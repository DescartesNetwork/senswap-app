import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import { CardPool } from 'senswap-ui/card';

import { } from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class LatestPromotion extends Component {
  constructor() {
    super();

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { setError, getPools, getPool, getPoolData } = this.props;
    return getPools({}, 9, 0).then(poolIds => {
      return Promise.all(poolIds.map(({ _id }) => getPool(_id)));
    }).then(data => {
      return Promise.all(data.map(({ address }) => getPoolData(address)));
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    // const { classes } = this.props;
    const { data } = this.state;

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
          <CardPool icons={icons} symbols={symbols} />
        </Grid>
      })}
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