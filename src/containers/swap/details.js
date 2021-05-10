import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import { IconButton } from 'senswap-ui/button';

import { ArrowForwardRounded } from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getMintData } from 'modules/bucket.reducer';


class Details extends Component {

  parseSymbol = (mintAddress, poolData) => {
    const { mint_a, mint_b, mint_s } = poolData;
    if (mintAddress === mint_a.address) return mint_a.symbol;
    if (mintAddress === mint_b.address) return mint_b.symbol;
    if (mintAddress === mint_s.address) return mint_s.symbol;
  }

  render() {
    const { classes, hopData } = this.props;
    if (!hopData || !hopData.length) return null;

    return <Grid container>
      <Grid item xs={12}>
        <Typography variant="caption" color="textSecondary">Swap Details</Typography>
      </Grid>
      <Grid item xs={12}>
        {hopData.map((data, index) => {
          const { srcMintAddress, dstMintAddress, poolData, fee, ratio, slippage } = data;
          return <Paper className={classes.details} key={index}>
            <Grid container>
              <Grid item xs={12}>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <Typography variant="subtitle1">{this.parseSymbol(srcMintAddress, poolData)}</Typography>
                  </Grid>
                  <Grid item>
                    <IconButton size="small">
                      <ArrowForwardRounded fontSize="small" color="disabled" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">{this.parseSymbol(dstMintAddress, poolData)}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography color="textSecondary">Fee</Typography>
                <Typography>{utils.prettyNumber(ssjs.undecimalize(fee, 9) * 100)}%</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography color="textSecondary">Ratio</Typography>
                <Typography>{utils.prettyNumber(ratio)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography color="textSecondary">Slippage</Typography>
                <Typography>{utils.prettyNumber(ssjs.undecimalize(slippage, 9) * 100)}%</Typography>
              </Grid>
            </Grid>
          </Paper>
        })}
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getMintData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Details)));