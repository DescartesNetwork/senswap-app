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

import styles from './styles';
class Volume extends Component {
  render() {
    const { classes, data, labels, info, loading: isLoading } = this.props;
    const styles = {
      backgroundColor: 'rgba(115, 136, 169, 0.353283)',
      borderColor: 'rgba(115, 136, 169, 0.353283)',
      borderRadius: 4,
    }

    if (isLoading) return <Skeleton variant="rect" height={320} className={classes.chart} />;

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
}, dispatch);

Volume.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Volume)));