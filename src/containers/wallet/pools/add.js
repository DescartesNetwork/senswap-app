import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { AddRounded, CloseRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getLPTData } from 'modules/bucket.reducer';


class Add extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      loading: false,
      lptAddress: '',
      data: {},
    }
  }

  fetchData = () => {
    const { lptAddress } = this.state;
    const { setError, getLPTData, } = this.props;
    return this.setState({ loading: true }, () => {
      if (!ssjs.isAddress(lptAddress)) return this.setState({ loading: false });
      return getLPTData(lptAddress).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onOpen = () => {
    return this.setState({ visible: true }, this.fetchData);
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onAddress = (e) => {
    const lptAddress = e.target.value || '';
    return this.setState({ lptAddress }, this.fetchData);
  }

  onAdd = () => {
    const { lptAddress } = this.state;
    const { wallet: { lpts }, setError, updateWallet } = this.props;
    const newLPTs = [...lpts];
    if (!newLPTs.includes(lptAddress)) newLPTs.push(lptAddress);
    return updateWallet({ lpts: newLPTs }).then(re => {
      return this.onClose();
    }).catch(er => {
      return setError(er);
    });
  }

  renderInfo = () => {
    const { data: { is_initialized } } = this.state;
    if (!is_initialized) return null;

    const {
      data: {
        lpt,
        pool: {
          address: poolAddress,
          fee: poolFee,
          reserve: poolReserve,
          lpt: poolLPT,
          mint,
          treasury
        }
      }
    } = this.state;
    const totalSupply = utils.prettyNumber(utils.div(mint.supply, global.BigInt(10 ** mint.decimals)));
    const lptAmount = utils.prettyNumber(utils.div(lpt, global.BigInt(10 ** mint.decimals)));
    const price = utils.div(poolLPT, poolReserve);
    const fee = ssjs.undecimalize(poolFee, 9) * 100;
    const reserve = utils.prettyNumber(utils.div(poolReserve, global.BigInt(10 ** mint.decimals)));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField label="LPT" variant="outlined" value={lptAmount} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">Pool Info</Typography>
      </Grid>
      <Grid item xs={6}>
        <TextField label="Pool Address" variant="outlined" value={poolAddress} fullWidth />
      </Grid>
      <Grid item xs={6}>
        <TextField label="Treasury Address" variant="outlined" value={treasury.address} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Fee %" variant="outlined" value={fee} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Reserve" variant="outlined" value={reserve} fullWidth />
      </Grid>
      <Grid item xs={4}>
        <TextField label="Price" variant="outlined" value={price} fullWidth />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">Token</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={mint.symbol}
          variant="outlined"
          value={mint.address}
          helperText={`Total supply: ${totalSupply} - Decimals: ${mint.decimals}`}
          fullWidth />
      </Grid>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { visible, loading, lptAddress } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Tooltip title="Add a LPT account">
          <IconButton color="primary" onClick={this.onOpen}>
            <AddRounded />
          </IconButton>
        </Tooltip>
        <Dialog open={visible} onClose={this.onClose}>
          <DialogTitle>
            <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
              <Grid item className={classes.stretch}>
                <Typography variant="h6">Add a LPT account</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={this.onClose} edge="end">
                  <CloseRounded />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  variant="outlined"
                  value={lptAddress}
                  onChange={this.onAddress}
                  InputProps={{
                    endAdornment: <IconButton
                      color="primary"
                      onClick={this.onAdd}
                      edge="end"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={17} /> : <AddRounded />}
                    </IconButton>
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                {this.renderInfo()}
              </Grid>
              <Grid item xs={12} /> {/* Safe space */}
            </Grid>
          </DialogContent>
        </Dialog>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet,
  getLPTData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Add)));