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

import styles from './styles';


class Reserve extends Component {

  render() {
    const { classes, poolData } = this.props;
    const { address: poolAddress, mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    const { symbol: symbolA, decimals: decimalsA } = mint_a || {};
    const { symbol: symbolB, decimals: decimalsB } = mint_b || {};
    const { symbol: symbolS, decimals: decimalsS } = mint_s || {};

    const reserveA = ssjs.undecimalize(reserve_a, decimalsA);
    const reserveB = ssjs.undecimalize(reserve_b, decimalsB);
    const reserveS = ssjs.undecimalize(reserve_s, decimalsS);

    if (!ssjs.isAddress(poolAddress)) return null;
    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Reserves</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography>{reserveA} {symbolA}</Typography>
          <Typography>{reserveB} {symbolB}</Typography>
          <Typography>{reserveS} {symbolS}</Typography>
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