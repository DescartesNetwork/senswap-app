import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';

import { Skeleton } from '@material-ui/lab';
import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';

import Chart from 'components/chart';
import { setError } from 'modules/ui.reducer';
import { getBoardDaily, getBoardStat } from 'modules/board.reducer';

import styles from './styles';
class Volume extends Component {
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
        const values = data.map(e => e.volume);
        const labels = data.map(e => e.time % 100);
        this.setState({ chartData: values, labels: labels });
      }
    } catch (err) {
      return setError(err);
    } finally {
      this.setState({ isLoading: false });
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
      backgroundColor: 'rgba(115, 136, 169, 0.353283)',
      borderColor: 'rgba(115, 136, 169, 0.353283)',
      borderRadius: 4,
    }

    if (isLoading) return <Skeleton variant="rect" height={320} className={classes.chart} />;
    if (!data || data.length < 1) return null;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Volume</Typography>
          <Typography variant="h5">{info && info.volume24h ? numeral(info.volume24h).format('$0.[0]a') : '$0'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <Chart data={data} labels={labels} type="bar" styles={styles} />
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

Volume.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Volume)));