import React, { Component, createRef, Fragment } from 'react';
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
import Paper from 'senswap-ui/paper';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import CircularProgress from 'senswap-ui/circularProgress';

import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import Farm from 'helpers/farm';

import styles from '../styles';
class Farming extends Component {
  constructor() {
    super();

    this.state = {
      maxToken: 0,
      disableStake: false,
      disableUnstake: false,
    };
    this.stakeRef = createRef();
  }

  handleStake = (type) => {
    const {
      onHandleStake,
      detail: { mint },
    } = this.props;
    const value = this.stakeRef.current.value;
    if (!value) return setError('Amount is required');
    onHandleStake(value, mint.address, type);
  };
  handleHarvest = () => {
    const { onHandleHarvest } = this.props;
    onHandleHarvest();
  };

  getMaxToken = (type) => {
    const {
      detail: { account, mint: { decimals }, debt },
    } = this.props;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const share = ssjs.undecimalize(account.amount, decimals);

    if (type === 'unstake') return this.setState({ maxToken: lpt }, () => {
      this.onChange();
    });
    return this.setState({ maxToken: share }, () => {
      this.onChange();
    });
  };

  onChange = () => {

    const {
      detail: { account, mint: { decimals }, debt },
    } = this.props;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const share = Number(ssjs.undecimalize(account.amount, decimals));
    const value = Number(this.stakeRef.current.value);
    this.setState({ maxToken: value, disableStake: false, disableUnstake: false });
    console.log(lpt, share, value, 'check');
    if (value > lpt) this.setState({ disableUnstake: true });
    if (value > share) this.setState({ disableStake: true });
  };

  render() {
    const { maxToken, disableStake, disableUnstake } = this.state;
    const {
      classes, visible, onClose,
      detail: { pool, debt },
      stakeLoading, unStakeLoading, harvestLoading,
    } = this.props;
    // //Render Stake Pool Element
    if (!pool || !pool.mintS) return null;
    const {
      mint_token: { decimals },
      total_shares,
      mintS: { icon: iconS, symbol: symbolS },
      mintA: { icon: iconA, symbol: symbolA },
      mintB: { icon: iconB, symbol: symbolB },
    } = pool;
    const icons = [iconA, iconB, iconS];
    const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
    //
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const total = Number(ssjs.undecimalize(total_shares, decimals));
    const portion = total ? lpt / total * 100 : 0;

    return (
      <Fragment>
        <Dialog open={visible} onClose={onClose}>
          <DialogTitle>Start farming</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center">
              {/* Annual percentage */}
              {/* <Drain size={0.5} /> */}
              {/* <Grid item xs={12}>
                <Typography color="textSecondary">Annual Percentage</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container>
                    <Grid item xs={2}>
                      <Typography color="textSecondary" variant="body2">APR:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{pool.apr || 0}%</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography color="textSecondary" variant="body2">APY:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{pool.apy || 0}%</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid> */}

              {/* Harvest */}

              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Pending reward</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container alignItems="flex-end">
                    <Grid item xs={12} md={6}>
                      <Grid container>
                        <Grid item>
                          <Typography color="textSecondary">Reward:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            <b style={{ color: '#ff3122' }}>{numeral(Farm.calculateReward(pool, debt)).format('0.00')}</b> SEN
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid container justify="flex-end">
                        <Grid item>
                          <Typography color="textSecondary">Period:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>{numeral(pool.period).format('0,0')} second</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} align="end">
                      <Button
                        variant="contained"
                        color="primary" onClick={this.handleHarvest}
                        fullWidth
                        disabled={harvestLoading}
                        startIcon={harvestLoading ? <CircularProgress size={17} /> : null}
                      >
                        Harvest
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              {/* <Grid item xs={12}>
              </Grid> */}
              <Drain size={1} />

              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Stake / Unstake</Typography>
              </Grid>

              {/* Stake + unStake */}
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container>
                    {/* <Grid item xs={12}>
                      <Typography color="textSecondary" variant="body2">
                        LP token:{' '}
                        <b style={{ color: '#ff3122' }}>
                          {Utils.prettyNumber(ssjs.undecimalize(account.amount, mint.decimals))}
                        </b>
                      </Typography>
                    </Grid> */}
                    <Grid item xs={12} md={6}>
                      <Grid container alignItems="flex-end">
                        <Grid item>
                          <Typography color="textSecondary">Total shares:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            {pool && pool.total_shares ? ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals) : 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid container justify="flex-end" alignItems="flex-end">
                        <Grid item>
                          <Typography color="textSecondary">Your LPT:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>{numeral(lpt).format('0.[0]a')} ({numeral(portion).format('0.[0]')}%)</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container className={classes.outlineInput} spacing={0}>
                        <Grid item xs={7}>
                          <Grid container alignItems="center">
                            <Grid item>
                              <AvatarGroup>
                                {icons ? (
                                  icons.map((e, idx) => {
                                    return <Avatar src={e} key={idx} />;
                                  })
                                ) : (
                                  <Avatar />
                                )}
                              </AvatarGroup>
                            </Grid>
                            <Grid item>
                              <Typography color="textSecondary">{name ? name : 'UNKNOWN'}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            variant="standard"
                            value={maxToken}
                            inputRef={this.stakeRef}
                            onChange={this.onChange}
                            InputProps={{
                              disableUnderline: true,
                              endAdornment: (
                                <Grid container align="end" spacing={0}>
                                  <Grid item xs={12}>
                                    <Typography
                                      variant="caption" color="error"
                                      style={{
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={this.getMaxToken}>
                                      <strong>MAX-STAKE</strong>
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Typography variant="caption"
                                      color="error"
                                      style={{
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={() => this.getMaxToken('unstake')}>
                                      <strong>MAX-UNSTAKE</strong>
                                    </Typography>
                                  </Grid>
                                </Grid>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6} className={classes.button}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.handleStake('stake')} fullWidth
                        disabled={stakeLoading || disableStake}
                        startIcon={stakeLoading ? <CircularProgress size={17} /> : null}
                      >
                        Stake
                      </Button>
                    </Grid>
                    <Grid item xs={6} className={classes.button}>
                      <Button
                        variant="outlined"
                        onClick={() => this.handleStake('unstake')}
                        fullWidth
                        disabled={unStakeLoading || disableUnstake}
                        startIcon={unStakeLoading ? <CircularProgress size={17} /> : null}
                      >
                        Unstake
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Drain size={2} />
            </Grid>
          </DialogContent>
        </Dialog>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setError,
      setSuccess,
      getStakePools,
    },
    dispatch,
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Farming)));
