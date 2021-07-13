import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import numeral from 'numeral';
import isEqual from 'react-fast-compare';

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
      maxStake: 0,
      maxUnstake: 0,
      disableStake: false,
      disableUnstake: false,
    };
    this.stakeRef = createRef();
    this.unstakeRef = createRef();
  }

  componentDidUpdate(prevProps) {
    const { visible: prevVisable } = prevProps;
    const { visible: currVisable } = this.props;
    // Clear input field when modal was closed
    if (!isEqual(prevVisable, currVisable) && !currVisable) return this.setState({ maxStake: 0, maxUnstake: 0 });
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

    if (type === 'unstake') return this.setState({ maxUnstake: lpt }, () => {
      this.onUnstakeChange();
    });
    return this.setState({ maxStake: share }, () => {
      this.onStakeChange();
    });
  };

  onStakeChange = () => {
    const {
      detail: { account, mint: { decimals } },
    } = this.props;
    const share = Number(ssjs.undecimalize(account.amount, decimals));
    const value = Number(this.stakeRef.current.value);
    this.setState({ maxStake: this.stakeRef.current.value, disableStake: value > share || value / value !== 1 });
  };

  onUnstakeChange = () => {
    const {
      detail: { mint: { decimals }, debt },
    } = this.props;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const value = Number(this.unstakeRef.current.value);
    this.setState({ maxUnstake: this.unstakeRef.current.value, disableUnstake: value > lpt || value / value !== 1 });
  };

  handleClose = () => {
    const { onClose } = this.props;
    // Clear input field
    this.setState({ maxStake: 0, maxUnstake: 0 });
    onClose();
  }

  render() {
    const { maxStake, maxUnstake, disableStake, disableUnstake } = this.state;
    const {
      classes, visible, onClose,
      detail: { account, mint, pool, debt },
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
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <AvatarGroup>
                  {icons ? (
                    icons.map((e, idx) => {
                      return <Avatar size="small" src={e} key={idx} />;
                    })
                  ) : (
                    <Avatar />
                  )}
                </AvatarGroup>
              </Grid>
              <Grid item>
                <Typography color="textSecondary">{name ? name : 'UNKNOWN'}</Typography>
              </Grid>
              <Drain size={2} />
              {/* Harvest */}
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Pending reward</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container alignItems="flex-end">
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={1}>
                        <Grid item xs={2}>
                          <Typography color="textSecondary">Period:</Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Typography>{numeral(pool.period).format('0,0')} second</Typography>
                        </Grid>
                        <Grid item xs={2}>
                          <Typography color="textSecondary">Reward:</Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Typography>
                            <b style={{ color: '#ff3122' }}>{numeral(Farm.calculateReward(pool, debt)).format('0.[00]')}</b> SEN
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={4} align="end" className={classes.button}>
                      <Button
                        variant="contained"
                        color="primary" onClick={this.handleHarvest}
                        fullWidth
                        disabled={harvestLoading}
                        startIcon={harvestLoading ? <CircularProgress size={17} /> : null}
                      >
                        <Typography>Harvest</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Stake */}
              <Drain size={1} />
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Stake</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container alignItems="flex-end">
                    <Grid item xs={12}>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Typography color="textSecondary">Total shares:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            {pool && pool.total_shares ? numeral(ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals)).format('0,0.[00]') : 0}
                          </Typography>
                        </Grid>
                        <Grid item className={classes.leftLine}>
                          <Typography color="textSecondary">Your share:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>{numeral(lpt).format('0,0.[00]')} ({numeral(portion).format('0.[0]')}%)</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={8}>
                      <Grid container justify="space-between" spacing={0}>
                        <Grid item>
                          <Typography variant="body2">LP Token</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="caption" color="textSecondary">
                            Available: {account && mint ? numeral(ssjs.undecimalize(account.amount, mint.decimals)).format('0,0.[00]') : 0} LPT</Typography>
                        </Grid>
                      </Grid>
                      <Grid container className={classes.outlineInput} spacing={0}>
                        <Grid item xs={12}>
                          <TextField
                            variant="standard"
                            value={maxStake}
                            inputRef={this.stakeRef}
                            onChange={this.onStakeChange}
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              endAdornment: (
                                <Typography
                                  color="error"
                                  style={{
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onClick={this.getMaxToken}>
                                  <strong>Max</strong>
                                </Typography>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4} className={classes.button}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => this.handleStake('stake')} fullWidth
                        disabled={stakeLoading || disableStake}
                        startIcon={stakeLoading ? <CircularProgress size={17} /> : null}
                      >
                        <Typography>Stake</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* UnStake */}
              <Drain size={1} />
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Unstake</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container alignItems="flex-end">
                    <Grid item xs={12}>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Typography color="textSecondary">Total shares:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>
                            {pool && pool.total_shares ? numeral(ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals)).format('0,0.[00]') : 0}
                          </Typography>
                        </Grid>
                        <Grid item className={classes.leftLine}>
                          <Typography color="textSecondary">Your share:</Typography>
                        </Grid>
                        <Grid item>
                          <Typography>{numeral(lpt).format('0,0.[00]')} ({numeral(portion).format('0.[0]')}%)</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={8}>
                      <Grid container justify="space-between" spacing={0}>
                        <Grid item>
                          <Typography variant="body2">LP Token</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="caption" color="textSecondary">
                            Available: {account && mint ? numeral(ssjs.undecimalize(account.amount, mint.decimals)).format('0,0.[00]') : 0} LPT</Typography>
                        </Grid>
                      </Grid>
                      <Grid container className={classes.outlineInput} spacing={0}>
                        <Grid item xs={12}>
                          <TextField
                            variant="standard"
                            value={maxUnstake}
                            inputRef={this.unstakeRef}
                            onChange={this.onUnstakeChange}
                            fullWidth
                            InputProps={{
                              disableUnderline: true,
                              endAdornment: (
                                <Typography
                                  color="error"
                                  style={{
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  onClick={() => this.getMaxToken('unstake')}>
                                  <strong>Max</strong>
                                </Typography>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4} className={classes.button} >
                      <Button
                        variant="outlined"
                        onClick={() => this.handleStake('unstake')} fullWidth
                        disabled={unStakeLoading || disableUnstake}
                        startIcon={unStakeLoading ? <CircularProgress size={17} /> : null}
                      >
                        <Typography>Unstake</Typography>
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
