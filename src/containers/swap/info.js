import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Zoom from '@material-ui/core/Zoom';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class SwapInfo extends Component {
  render() {
    const { classes } = this.props;
    const { data } = this.props;

    return <Grid container spacing={2} justify="center" alignItems="center">
      {data.map(({ bidData, askData, fee, ratio }, index) => <Grid key={index} item xs={11}>
        <Zoom in={true}>
          <Grid container spacing={2} className={classes.noWrap} alignItems="center">
            <Grid item>
              <MintAvatar icon={bidData.mint.icon} />
            </Grid>
            <Grid item className={classes.stretch}>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant="h6" align="center"><span className={classes.subtitle}>Fee</span> {ssjs.undecimalize(fee, 9) * 100}%</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h6" align="center"><span className={classes.subtitle}>{askData.mint.symbol}/{bidData.mint.symbol}</span> {utils.prettyNumber(ratio)}</Typography>
            </Grid>
            <Grid item className={classes.stretch}>
              <Divider />
            </Grid>
            <Grid item>
              <MintAvatar icon={askData.mint.icon} />
            </Grid>
          </Grid>
        </Zoom>
      </Grid>)}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPoolData,
}, dispatch);

SwapInfo.defaultProps = {
  data: [],
}

SwapInfo.propTypes = {
  data: PropTypes.array,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SwapInfo)));