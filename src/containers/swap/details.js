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
import { IconButton } from 'senswap-ui/button';
import Link from 'senswap-ui/link';

import {
  ArrowForwardRounded, ArrowDropDownRounded, DoneRounded,
  CloseRounded,
} from 'senswap-ui/icons';

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

  renderRoute = (data) => {
    const { classes, ui: { type } } = this.props;
    const { srcMintAddress, dstMintAddress, poolData } = data;
    return <Grid container className={classes.noWrap} alignItems="center">
      <Grid item>
        <Grid container className={classes.noWrap} alignItems="center" spacing={1}>
          {type !== 'xs' ? <Grid item>
            <MintAvatar icon={this.parseIcon(srcMintAddress, poolData)} />
          </Grid> : null}
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
          {type !== 'xs' ? <Grid item>
            <MintAvatar icon={this.parseIcon(dstMintAddress, poolData)} />
          </Grid> : null}
          <Grid item>
            <Typography variant="subtitle1">{this.parseSymbol(dstMintAddress, poolData)}</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }

  renderStatus = (txId) => {
    const { classes } = this.props;
    if (!txId) return null;
    if (txId === 'error') return <Grid container spacing={0} className={classes.noWrap}>
      <Grid item>
        <IconButton size="small">
          <CloseRounded className={classes.failed} fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item>
        <Link className={classes.failed} variant="body2">Failed</Link>
      </Grid>
    </Grid>
    return <Grid container spacing={0} className={classes.noWrap}>
      <Grid item>
        <IconButton size="small">
          <DoneRounded className={classes.success} fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item>
        <Link
          className={classes.success}
          variant="body2"
          href={utils.explorer(txId)}
        >Success</Link>
      </Grid>
    </Grid>
  }

  renderOfferingPrice = (data) => {
    const { classes } = this.props;
    const { srcMintAddress, dstMintAddress, poolData, ratio } = data;
    return <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
      <Grid item>
        <Typography color="textSecondary">Offering Price</Typography>
      </Grid>
      <Grid item>
        <Typography>{utils.prettyNumber(ratio)} <span className={classes.unit}>{this.parseSymbol(dstMintAddress, poolData)}/{this.parseSymbol(srcMintAddress, poolData)}</span></Typography>
      </Grid>
    </Grid>
  }

  renderPriceChange = (data) => {
    const { classes } = this.props;
    const { slippage } = data;
    return <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
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
  }

  renderFee = (data) => {
    const { fee } = data;
    return <Grid container spacing={0} direction="column" style={{ paddingRight: 16 }}>
      <Grid item>
        <Typography color="textSecondary">Fee</Typography>
      </Grid>
      <Grid item>
        <Typography>{utils.prettyNumber(ssjs.undecimalize(fee, 9) * 100)}%</Typography>
      </Grid>
    </Grid>
  }

  render() {
    const { classes, hopData, txIds } = this.props;
    if (!hopData || !hopData.length) return null;

    return <Grid container>
      <Grid item xs={12}>
        <Typography variant="caption" color="textSecondary">Swap Details</Typography>
      </Grid>
      {hopData.map((data, index) => <Grid item key={index} xs={12}>
        <Paper className={classes.details}>
          <Grid container>
            <Grid item xs={12}>
              <Grid container className={classes.noWrap} alignItems="center">
                <Grid item className={classes.stretch}>
                  {this.renderRoute(data)}
                </Grid>
                <Grid item>
                  {this.renderStatus(txIds[index])}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              {this.renderOfferingPrice(data)}
            </Grid>
            <Grid item>
              {this.renderPriceChange(data)}
            </Grid>
            <Grid item>
              {this.renderFee(data)}
            </Grid>
          </Grid>
        </Paper>
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
  getMintData,
}, dispatch);

Details.defaultProps = {
  hopData: [],
  txIds: [],
}

Details.propTypes = {
  hopData: PropTypes.array,
  txIds: PropTypes.array,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Details)));