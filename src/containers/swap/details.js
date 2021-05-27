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

import { ArrowForwardRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

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

  parseIcon = (mintAddress, poolData) => {
    const { mint_a, mint_b, mint_s } = poolData;
    if (mintAddress === mint_a.address) return mint_a.icon;
    if (mintAddress === mint_b.address) return mint_b.icon;
    if (mintAddress === mint_s.address) return mint_s.icon;
  }

  parseReserve = (mintAddress, poolData) => {
    const { mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    if (mintAddress === mint_a.address) return ssjs.undecimalize(reserve_a, mint_a.decimals);
    if (mintAddress === mint_b.address) return ssjs.undecimalize(reserve_b, mint_b.decimals);
    if (mintAddress === mint_s.address) return ssjs.undecimalize(reserve_s, mint_s.decimals);
  }

  render() {
    const { classes, hopData } = this.props;
    if (!hopData || !hopData.length) return null;

    return <Grid container>
      <Grid item xs={12}>
        <Typography variant="caption" color="textSecondary">Swap Details</Typography>
      </Grid>
      {hopData.map((data, index) => {
        const { srcMintAddress, dstMintAddress, poolData, fee, ratio, slippage } = data;
        return <Grid item key={index} xs={12}>
          <Paper className={classes.details}>
            <Grid container>
              <Grid item xs={12}>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item>
                    <Grid container className={classes.noWrap} alignItems="center" spacing={1}>
                      <Grid item>
                        <MintAvatar icon={this.parseIcon(srcMintAddress, poolData)} />
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1">{this.parseSymbol(srcMintAddress, poolData)}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <IconButton size="small">
                      <ArrowForwardRounded fontSize="small" color="disabled" />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Grid container className={classes.noWrap} alignItems="center" spacing={1}>
                      <Grid item>
                        <MintAvatar icon={this.parseIcon(dstMintAddress, poolData)} />
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1">{this.parseSymbol(dstMintAddress, poolData)}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
                  <Grid item>
                    <Typography color="textSecondary">Offering Price</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{utils.prettyNumber(ratio)} <span className={classes.unit}>{this.parseSymbol(dstMintAddress, poolData)}/{this.parseSymbol(srcMintAddress, poolData)}</span></Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
                  <Grid item>
                    <Typography color="textSecondary">Price Change</Typography>
                  </Grid>
                  <Grid item>
                    <Grid container spacing={0} className={classes.noWrap}>
                      {slippage ? <Grid item className={classes.opticalCorrection}>
                        < ArrowDropDownRounded style={{ color: '#f44336' }} />
                      </Grid> : null}
                      <Grid item>
                        <Typography style={{ color: slippage ? '#f44336' : '#ff9800' }}>{utils.prettyNumber(ssjs.undecimalize(slippage, 9) * 100)}%</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
                  <Grid item>
                    <Typography color="textSecondary">Fee</Typography>
                  </Grid>
                  <Grid item>
                    <Typography>{utils.prettyNumber(ssjs.undecimalize(fee, 9) * 100)}%</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      })}
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