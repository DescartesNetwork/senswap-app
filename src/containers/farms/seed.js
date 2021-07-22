import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Paper from 'senswap-ui/paper';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';

import styles from './styles';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';


class Seed extends Component {
  constructor() {
    super();

    this.state = {
      maxToken: 0,
      seedLoading: false,
      unSeedLoading: false,
    };
    this.seedRef = createRef();
  }

  handleSeed = (type) => {
    const { detail } = this.props;
    const { senWallet, pool: { address: stakePoolAddress } } = detail;
    console.log(detail)
    const amount = this.seedRef.current.value;
    const reserveAmount = ssjs.decimalize(amount, 9);
    if (!amount) return setError('Amount is required');
    const params = {
      reserveAmount,
      stakePoolAddress,
      senWallet,
    };
    if (type === 'unseed') return this.unseed(params);
    return this.seed(params);
  };

  seed = async (data) => {
    const { wallet, farming: liteFarming } = window.senswap;
    const { setSuccess, setError } = this.props;
    const { reserveAmount: amount, stakePoolAddress, senWallet } = data;
    this.setState({ seedLoading: true });
    try {
      const seed = await liteFarming.seed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      await setSuccess('Successfully');
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ seedLoading: false }, () => {
        this.onHandleClose();
      });
    }
  };
  unseed = async (data) => {
    const { wallet, farming: liteFarming } = window.senswap;
    const { setSuccess, setError } = this.props;
    const { reserveAmount: amount, stakePoolAddress, senWallet } = data;
    this.setState({ unSeedLoading: true });
    try {
      const seed = await liteFarming.unseed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');

      await setSuccess('Successfully');
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ unSeedLoading: false }, () => {
        this.onHandleClose();
      });
    }
  };

  getMaxToken = () => {
    const {
      detail: { pool, amount: accAmount },
    } = this.props;
    if (!pool) return;
    const {
      mint_token: { decimals },
    } = pool;
    const total = ssjs.undecimalize(accAmount, decimals);
    return this.setState({ maxToken: total });
  };

  onChange = () => {
    const value = this.seedRef.current.value;
    this.setState({ maxToken: value });
  };

  onHandleClose = () => {
    const { onClose } = this.props;
    this.setState({ maxToken: 0 });
    return onClose();
  };

  render() {
    const { maxToken, seedLoading, unSeedLoading } = this.state;
    const { classes, visible, detail: data } = this.props;
    if (!data || !data.pool) return null;
    const {
      pool: {
        treasury_sen: { amount },
        mintS: { icon: iconS, symbol: symbolS },
        mintA: { icon: iconA, symbol: symbolA },
        mintB: { icon: iconB, symbol: symbolB },
      },
      mint: { decimals },
      amount: accAmount,
    } = data;
    const icons = [iconA, iconB, iconS];
    const name = `${symbolA} x ${symbolB} x ${symbolS}`;

    return <Dialog open={visible} onClose={this.onHandleClose}>
      <DialogTitle>Seed / Unseed</DialogTitle>
      <DialogContent>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">Start seeding: </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.formPaper}>
              <Grid container justify="space-between">
                <Grid item className={classes.label}>
                  <Typography color="textSecondary">Total SEN:</Typography>
                  <Typography className={classes.amount}>
                    {amount ? numeral(ssjs.undecimalize(amount, decimals)).format('0,0.[00]') : 0}
                  </Typography>
                  <Typography>SEN</Typography>
                </Grid>

                <Grid item className={classes.label}>
                  <Typography color="textSecondary">Available SEN: </Typography>
                  <Typography className={classes.amount}>
                    {accAmount ? numeral(ssjs.undecimalize(accAmount, decimals)).format('0,0.[00]') : 0}
                  </Typography>
                  <Typography>SEN</Typography>
                </Grid>
              </Grid>
              <Drain size={3} />

              <Grid item xs={12}>
                <Grid container className={classes.outlineInput} spacing={0}>
                  <Grid item xs={6}>
                    <Grid container alignItems="center">
                      <Grid item>
                        <AvatarGroup>
                          {icons ? icons.map((e, idx) => <Avatar src={e} key={idx} />) : <Avatar />}
                        </AvatarGroup>
                      </Grid>
                      <Grid item>
                        <Typography color="textSecondary">{name ? name : 'UNKNOWN'}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} align="right">
                    <TextField
                      variant="standard"
                      value={maxToken}
                      inputRef={this.seedRef}
                      onChange={this.onChange}
                      fullWidth
                      className={classes.textRight}
                      InputProps={{
                        disableUnderline: true,
                        endAdornment: <Typography color="error" style={{ cursor: 'pointer' }} onClick={this.getMaxToken}>
                          <strong>MAX</strong>
                        </Typography>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Drain size={3} />

              {/* Button */}
              <Grid item xs={12} align="end">
                <Grid container>
                  <Grid item xs={6} className={classes.button}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => this.handleSeed()}
                      fullWidth
                      disabled={seedLoading}
                      startIcon={seedLoading ? <CircularProgress size={17} /> : null}
                    >Seed</Button>
                  </Grid>
                  <Grid item xs={6} className={classes.button}>
                    <Button
                      variant="outlined"
                      onClick={() => this.handleSeed('unseed')}
                      fullWidth
                      disabled={unSeedLoading}
                      startIcon={unSeedLoading ? <CircularProgress size={17} /> : null}
                    >Unseed</Button>
                  </Grid>
                </Grid>
                <Drain size={1} />
              </Grid>
            </Paper>
          </Grid>
          <Drain size={2} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  setError,
  setSuccess,
  getStakePools,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Seed)));
