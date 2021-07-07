import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import Paper from 'senswap-ui/paper';
import styles from './styles';
import Farm from 'helpers/farm';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import Utils from 'helpers/utils';
class Farming extends Component {
  constructor() {
    super();

    this.state = {
      maxToken: 0,
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

  getMaxToken = () => {
    const {
      detail: { account, mint },
    } = this.props;

    const share = ssjs.undecimalize(account.amount, mint.decimals);
    return this.setState({ maxToken: share });
  };

  onChange = () => {
    const value = this.stakeRef.current.value;
    this.setState({ maxToken: value });
  };

  render() {
    const { maxToken } = this.state;
    const {
      classes,
      visible,
      onClose,
      detail: { mint, account, pool, debt },
    } = this.props;
    console.log('this.props', this.props);
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
    console.log("lpt", lpt)
    console.log("total", total)
    const portion = total ? lpt / total * 100 : 0;

    return (
      <Fragment>
        <Dialog open={visible} onClose={onClose}>
          <DialogTitle>Stat farming</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center">
              {/* Annual percentage */}
              <Drain size={2} />
              <Grid item xs={12}>
                <Typography color="textSecondary">Annual Percentage</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container>
                    <Grid item xs={2}>
                      <Typography variant="body2">APR:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{pool.apr || 0}%</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2">APY:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{pool.apy || 0}%</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>

              {/* Havest */}

              <Grid item xs={12}>
                <Typography color="textSecondary">Pending reward</Typography>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container alignItems="flex-end">
                    <Grid item xs={2}>
                      <Typography variant="body2">Total shares:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>
                        {pool && pool.total_shares ? ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals) : 0}
                      </Typography>
                    </Grid>

                    <Grid item xs={2}>
                      <Typography variant="body2">Your LPT:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{Utils.prettyNumber(lpt)}</Typography>
                    </Grid>

                    <Grid item xs={2}>
                      <Typography variant="body2">Your Portion:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{portion}% </Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="body2">Period:</Typography>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography>{Utils.prettyNumber(pool.period)} second</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography>Reward:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        <b style={{ color: '#ff3122' }}>{Utils.prettyNumber(Farm.calculateReward(pool, debt))}</b> SEN
                      </Typography>
                    </Grid>
                    <Grid item xs={4} align="end">
                      <Button variant="contained" color="primary" onClick={this.handleHarvest}>
                        Harvest
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>

              <Grid item xs={12}>
                <Typography color="textSecondary">Stake / Unstake</Typography>
              </Grid>

              {/* Stake + unStake */}
              <Grid item xs={12}>
                <Paper className={classes.formPaper}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography>
                        LP token:{' '}
                        <b style={{ color: '#ff3122' }}>
                          {Utils.prettyNumber(ssjs.undecimalize(account.amount, mint.decimals))}
                        </b>
                      </Typography>
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
                                <Typography color="error" style={{ cursor: 'pointer' }} onClick={this.getMaxToken}>
                                  <strong>MAX</strong>
                                </Typography>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={6} className={classes.button}>
                      <Button variant="contained" color="primary" onClick={() => this.handleStake('stake')} fullWidth>
                        Stake
                      </Button>
                    </Grid>
                    <Grid item xs={6} className={classes.button}>
                      <Button variant="outlined" onClick={() => this.handleStake('unstake')} fullWidth>
                        Unstake
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Drain size={5} />
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
