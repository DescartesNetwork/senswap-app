import React, { Component, createRef, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router-dom";
import ssjs from "senswapjs";

import { withStyles } from "senswap-ui/styles";
import Grid from "senswap-ui/grid";
import Typography from "senswap-ui/typography";
import Dialog, { DialogTitle, DialogContent } from "senswap-ui/dialog";
import Drain from "senswap-ui/drain";
import TextField from "senswap-ui/textField";
import Button from "senswap-ui/button";
import CircularProgress from "senswap-ui/circularProgress";
import { setError, setSuccess } from "modules/ui.reducer";
import { getStakePools } from "modules/stakePool.reducer";
import { MintAvatar } from "containers/wallet";
import Paper from 'senswap-ui/paper';

import styles from "../styles";
import Farm from "../../../helpers/farm";
import Avatar, { AvatarGroup } from "senswap-ui/avatar";
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
    if (!value) return setError("Amount is required");
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
      stakeLoading,
      unStakeLoading,
    } = this.props;
    if (!pool) return null;

    const { icons, symbols } = pool;

    return (
      <Fragment>
        <Dialog open={visible} onClose={onClose}>
          <DialogTitle>Stat farming</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <Typography color="textSecondary">Stake pool</Typography>
              </Grid>
              <Paper className={classes.formPaper}>
                <Grid container >
                  <Grid item xs={2}>
                    <Typography variant="body2">Address:</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography>{pool.address}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">Total shares:</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography>{pool && pool.total_shares ? ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals) : 0}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Annual percentage */}
              <Drain size={2} />
              <Grid item xs={12}>
                <Typography color="textSecondary">Annual Percentage</Typography>
              </Grid>
              <Paper className={classes.formPaper}>
                <Grid container>
                  <Grid item xs={2}>
                    <Typography variant="body2">APR:</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography>{pool.apr}%</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">APY: {pool.apy}%</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography>{pool.apy}%</Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>

              {/* Havest */}

              <Grid item xs={12}>
                <Typography color="textSecondary">Pending reward</Typography>
              </Grid>
              <Paper className={classes.formPaper}>
                <Grid container alignItems="flex-end">
                  <Grid item xs={2}>
                    <Typography variant="body2">Period:</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Typography variant="body2">{pool && pool.period ? ssjs.undecimalize(pool.period, 1) : 0} second</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography>Reward:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <b style={{ color: "#ff3122" }}>{Farm.calculateReward(pool, debt)}</b> SEN
                </Typography>
                  </Grid>
                  <Grid item xs={4} align="end">
                    <Button variant="contained" color="primary" onClick={this.handleHarvest}>
                      Harvest
                </Button>
                  </Grid>
                </Grid>
              </Paper>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>

              <Grid item xs={12}>
                <Typography color="textSecondary">Stake / Unstake</Typography>
              </Grid>

              {/* Stake + unStake */}
              <Paper className={classes.formPaper}>
                <Grid container>
                  <Grid item xs={12}>
                    <Typography>
                      LP token: <b style={{ color: "#ff3122" }}>{ssjs.undecimalize(account.amount, mint.decimals)}</b>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center" className={classes.outlineInput}>
                      <Grid item xs={6}>
                        <AvatarGroup>
                          {icons ? icons.map((e, idx) => {
                            return <Avatar src={e} key={idx} />
                          }) : <Avatar />}
                        </AvatarGroup>
                        <Typography color="textSecondary">{symbols ? symbols.map((symbol, idx) => {
                          return <Fragment key={idx}>{symbol}{symbol.length > Number(idx + 1) ? ' x ' : ''}</Fragment>
                        }) : 'UNKNOWN'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          variant="standard"
                          value={maxToken}
                          inputRef={this.stakeRef}
                          onChange={this.onChange}
                          InputProps={{
                            endAdornment: (
                              <Typography color="error" style={{ cursor: "pointer" }} onClick={this.getMaxToken}>
                                <strong>MAX</strong>
                              </Typography>
                            ),
                          }}
                          multiline={false}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    {stakeLoading ? (
                      <Button variant="contained" color="primary" fullWidth>
                        Stake <CircularProgress size={16} />
                      </Button>
                    ) : (
                      <Button variant="contained" color="primary" onClick={() => this.handleStake("stake")} fullWidth>
                        Stake
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {unStakeLoading ? (
                      <Button variant="outlined" fullWidth>UnStake</Button>
                    ) : (
                      <Button variant="outlined" onClick={() => this.handleStake("unstake")} fullWidth>
                        UnStake
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
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
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Farming)));
