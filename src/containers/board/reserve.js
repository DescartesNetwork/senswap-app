import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Box from 'senswap-ui/box';

import Chart from 'components/chart';

import styles from './styles';


class Reserve extends Component {

  setData = () => {
    console.log('set data')
  }

  render() {
    const { classes, poolData } = this.props;
    const { address: poolAddress, mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    const { symbol: symbolA, decimals: decimalsA } = mint_a || {};
    const { symbol: symbolB, decimals: decimalsB } = mint_b || {};
    const { symbol: symbolS, decimals: decimalsS } = mint_s || {};

    const reserveA = ssjs.undecimalize(reserve_a, decimalsA);
    const reserveB = ssjs.undecimalize(reserve_b, decimalsB);
    const reserveS = ssjs.undecimalize(reserve_s, decimalsS);
    const data = [
      { label: symbolA, value: reserveA, color: '#147AD6' },
      { label: symbolB, value: reserveB, color: '#79D2DE' },
      { label: symbolS, value: reserveS, color: '#EC6666' }
    ];
    const labels = data ? data.map(e => e.label) : [];
    const styles = {
      label: 'Volume 24h',
      backgroundColor: data ? data.map(e => e.color) : [],
      borderColor: data ? data.map(e => e.color) : [],
      borderRadius: 0,
    };
    const chartData = data ? data.map(e => e.value) : [];

    if (!ssjs.isAddress(poolAddress)) return null;
    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Reserves</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container justify="center">
            <Grid item xs={12} sm={12} md={8}>
              <Box mb={4} mt={3} >
                <Chart data={chartData} labels={labels} styles={styles} type="doughnut" disableAxe={true} />
              </Box>
              {data ? data.map((e, idx) => {
                return <Grid className={classes.circle} key={idx}>
                  <Typography key={idx}>{e.label} {e.value}</Typography>
                  <Grid style={{ background: e.color }} className="circle" />
                </Grid>
              }) : null}
            </Grid>
          </Grid>
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

Reserve.defaultProps = {
  poolData: {}
}

Reserve.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Reserve)));