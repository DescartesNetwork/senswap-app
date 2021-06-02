import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';

import Chart from 'components/chart';
import Utils from 'helpers/utils';

import styles from './styles';

const INSTANCE = axios.create({
  baseURL: 'http://18.117.93.162:9090/stat/reports',
  timeout: 60000,
});
class TVL extends Component {
  constructor() {
    super()
    this.state = {
      data: [],
      labels: [],
      info: {}
    }
  }
  endpoint(type, id) {
    return `${type}/pools/${id}`;
  }

  componentDidMount() {
    const { poolAddress: id } = this.props;

    INSTANCE.get(this.endpoint('daily', id)).then(({ data }) => {
      if (data) {
        const values = data.map(e => e.volume)
        const labels = data.map(e => e.time % 100);
        this.setState({ data: values });
        this.setState({ labels: labels });
      }
    });
    INSTANCE.get(this.endpoint('stat', id)).then(({ data }) => {
      if (data) this.setState({ info: data });
    });
  }

  render() {
    const { classes } = this.props;
    const { data, labels, info } = this.state;
    const styles = {
      backgroundColor: '#883636',
      borderColor: '#883636',
      borderRadius: 0,
    }

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">TVL</Typography>
          <Typography variant="h5">{info && info.volume24h ? Utils.formatCurrency(info.tvl) : '$0'}</Typography>
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
}, dispatch);

TVL.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TVL)));