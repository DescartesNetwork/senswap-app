import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import axios from 'axios';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Paper from 'senswap-ui/paper';
import Typography from 'senswap-ui/typography';

import Utils from 'helpers/utils';
import Chart from 'components/chart';

import styles from './styles';

const INSTANCE = axios.create({
  baseURL: 'http://18.117.93.162:9090/stat/reports',
  timeout: 60000,
});
class Volume extends Component {
  constructor() {
    super();

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
      backgroundColor: 'rgba(115, 136, 169, 0.353283)',
      borderColor: 'rgba(115, 136, 169, 0.353283)',
      borderRadius: 4,
    }

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Volume</Typography>
          <Typography variant="h5">{info && info.volume24h ? Utils.formatCurrency(info.volume24h) : '$0'}</Typography>
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
}, dispatch);

Volume.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Volume)));