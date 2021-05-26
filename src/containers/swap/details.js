import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import { IconButton } from 'senswap-ui/button';
import Divider from 'senswap-ui/divider';

import {
  ArrowForwardRounded, ExpandLessRounded, ExpandMoreRounded,
  ArrowDropDownRounded
} from 'senswap-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getMintData } from 'modules/bucket.reducer';


class Details extends Component {
  constructor() {
    super();

    this.state = {
      visibles: []
    }
  }

  parseSymbol = (mintAddress, poolData) => {
    const { mint_a, mint_b, mint_s } = poolData;
    if (mintAddress === mint_a.address) return mint_a.symbol;
    if (mintAddress === mint_b.address) return mint_b.symbol;
    if (mintAddress === mint_s.address) return mint_s.symbol;
  }

  parseReserve = (mintAddress, poolData) => {
    const { mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    if (mintAddress === mint_a.address) return ssjs.undecimalize(reserve_a, mint_a.decimals);
    if (mintAddress === mint_b.address) return ssjs.undecimalize(reserve_b, mint_b.decimals);
    if (mintAddress === mint_s.address) return ssjs.undecimalize(reserve_s, mint_s.decimals);
  }

  onAdvance = (index) => {
    const { visibles } = this.state;
    const newVisibles = [...visibles];
    newVisibles[index] = !newVisibles[index];
    return this.setState({ visibles: newVisibles });
  }

  render() {
    const { classes, hopData } = this.props;
    const { visibles } = this.state;
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
                      <Grid item className={classes.opticalCorrection}>
                        < ArrowDropDownRounded style={{ color: "#FF7A68" }} />
                      </Grid>
                      <Grid item>
                        <Typography style={{ color: "#FF7A68" }}>{utils.prettyNumber(ssjs.undecimalize(slippage, 9) * 100)}%</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {visibles[index] ? <Fragment>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">{this.parseSymbol(srcMintAddress, poolData)} Reserve</Typography>
                  <Typography>{utils.prettyNumber(this.parseReserve(srcMintAddress, poolData))}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">{this.parseSymbol(dstMintAddress, poolData)} Reserve</Typography>
                  <Typography>{utils.prettyNumber(this.parseReserve(dstMintAddress, poolData))}</Typography>
                </Grid>
              </Fragment> : null}
              <Grid item xs={12} style={{ padding: 0 }}>
                <Grid container justify="center">
                  <Grid item>
                    <IconButton size="small" onClick={() => this.onAdvance(index)}>
                      {visibles[index] ? <ExpandLessRounded fontSize="small" color="disabled" /> : <ExpandMoreRounded fontSize="small" color="disabled" />}
                    </IconButton>
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