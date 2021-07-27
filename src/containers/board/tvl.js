import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';
import { Skeleton } from '@material-ui/lab';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';

import Chart from 'components/chart';
import { setError } from 'modules/ui.reducer';
import { getBoardDaily, getBoardStat } from 'modules/board.reducer';

import styles from './styles';
class TVL extends Component {
  constructor() {
    super();

    this.state = {
      chartData: [],
      labels: [],
      info: {},
      isLoading: false,
    }
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.getDaily();
    this.getStat();
  }

  getDaily = async () => {
    const { getBoardDaily, poolAddress: address } = this.props;
    try {
      const data = await getBoardDaily(address);
      if (data) {
        data.sort((a, b) => a.time - b.time);
        const values = data.map(e => e.tvl);
        const labels = data.map(e => e.time % 100);
        this.setState({ chartData: values });
        this.setState({ labels: labels });
        setTimeout(() => {
          this.setState({ isLoading: false });
        }, 800);
      }
    } catch (err) {
      return setError(err);
    }
  }

  getStat = async () => {
    const { getBoardStat, poolAddress: address } = this.props;
    try {
      const data = await getBoardStat(address);
      if (data) this.setState({ info: data });
    } catch (err) {
      return setError(err);
    }
  }
  render() {
    const { classes } = this.props;
    const { isLoading, chartData: data, info, labels } = this.state;
    const styles = {
      backgroundColor: '#883636',
      borderColor: '#883636',
      borderRadius: 0,
    }

    if (isLoading) return <Skeleton variant="rect" height={320} className={classes.chart} />;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">TVL</Typography>
          <Typography variant="h5">{info && info.volume24h ? numeral(info.tvl).format('$0.[0]a') : '$0'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Chart data={data} labels={labels} type="line" styles={styles} fill={true} tension="0.4" pointRadius="0" />
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getBoardDaily, getBoardStat,
}, dispatch);

TVL.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TVL)));