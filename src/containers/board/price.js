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
import Divider from 'senswap-ui/divider';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';

import { HelpOutlineRounded } from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class Price extends Component {

  render() {
    const { classes, poolData } = this.props;
    const { address: poolAddress, mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    const { icon: iconA, symbol: symbolA, decimals: decimalsA } = mint_a || {};
    const { icon: iconB, symbol: symbolB, decimals: decimalsB } = mint_b || {};
    const { icon: iconS, symbol: symbolS, decimals: decimalsS } = mint_s || {};
    const SA = ssjs.undecimalize(reserve_s, decimalsS) / ssjs.undecimalize(reserve_a, decimalsA);
    const SB = ssjs.undecimalize(reserve_s, decimalsS) / ssjs.undecimalize(reserve_b, decimalsB);

    if (!ssjs.isAddress(poolAddress)) return null;
    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">In-pool Prices</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container className={classes.noWrap} alignItems="center">
            <Grid item>
              <AvatarGroup>
                <Avatar src={iconA} className={classes.icon} >
                  <HelpOutlineRounded />
                </Avatar>
                <Avatar src={iconS} className={classes.icon} >
                  <HelpOutlineRounded />
                </Avatar>
              </AvatarGroup>
            </Grid>
            <Grid item>
              <Typography>{`${symbolA} / ${symbolS}`}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{utils.prettyNumber(SA)} <span className={classes.unit}>{symbolS}</span></Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Grid container className={classes.noWrap} alignItems="center">
            <Grid item>
              <AvatarGroup>
                <Avatar src={iconB} className={classes.icon} >
                  <HelpOutlineRounded />
                </Avatar>
                <Avatar src={iconS} className={classes.icon} >
                  <HelpOutlineRounded />
                </Avatar>
              </AvatarGroup>
            </Grid>
            <Grid item>
              <Typography>{`${symbolB} / ${symbolS}`}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5">{utils.prettyNumber(SB)} <span className={classes.unit}>{symbolS}</span></Typography>
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

Price.defaultProps = {
  poolData: {}
}

Price.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Price)));