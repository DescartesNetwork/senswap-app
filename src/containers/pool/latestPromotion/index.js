import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import CircularProgress from 'senswap-ui/circularProgress';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';

import { PoolCard } from 'containers/pool';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools } from 'modules/pool.reducer';


class LatestPromotion extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
      page: 0,
      limit: 6,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const { setError, getPools } = this.props;
    const { data, page, limit } = this.state;
    try {
      this.setState({ loading: true });
      const pools = await getPools({}, limit, page);
      const expandedData = data.concat(pools);
      return this.setState({ data: expandedData, loading: false });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onMore = () => {
    const { page } = this.state;
    return this.setState({ page: page + 1 }, this.fetchData);
  }

  render() {
    const { loading, data } = this.state;

    return <Grid container spacing={2}>
      {data.map(({ address: poolAddress }, i) => <PoolCard poolAddress={poolAddress} key={i} />)}
      <Grid item xs={12}>
        <Drain size={1} />
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center">
          <Button onClick={this.onMore} disabled={loading} startIcon={loading ? <CircularProgress size={17} /> : null}>
            <Typography>See more</Typography>
          </Button>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  pool: state.pool
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPools,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LatestPromotion)));