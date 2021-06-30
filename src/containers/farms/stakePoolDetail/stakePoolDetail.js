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

import styles from "../styles";
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
    console.log(value);
    this.setState({ maxToken: value });
  };

  toNumber(bigInt, decimal = 0) {
    return Number(bigInt.toString()) / Math.pow(10, decimal);

  }
  calculateReward = (pool, debt) => {
    if (debt === null || pool === null) return 0;
    const p = this.toNumber(pool.reward, 9) / this.toNumber(pool.total_shares, 9);
    const t = ((Date.now() / 1000) - Number(pool.genesis_timestamp.toString())) / this.toNumber(pool.period);
    const r_i = this.toNumber(debt.account.amount, 9);
    const d_i = this.toNumber(debt.debt, 9);
    const D = this.toNumber(pool.compensation, 18);

    const result = p * t * r_i - d_i + D * r_i;
    console.log(result);
    return (result);
    // return Math.round((p * Math.floor(t) * r_i - d_i + D * r_i) * 1000.0) / 1000.0;
  }

  render() {
    const { maxToken } = this.state;
    const {
      visible,
      onClose,
      detail: { mint, account, pool, debt },
      stakeLoading,
      unStakeLoading,
    } = this.props;
    if (!mint) return null;

    const { icon, name } = mint;

    return (
      <Fragment>
        <Dialog open={visible} onClose={onClose}>
          <DialogTitle>Stat farming</DialogTitle>
          <DialogContent>
            <Grid container alignItems="center">
              <Grid item xs={12}>
                <Typography color="textSecondary">Stake pool</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Address: {pool.address}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">Total shares: {pool && pool.total_shares ? ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals) : 0}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary">Annual Percentage</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">APR: {pool.apr}%</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">APY: {pool.apy}%</Typography>
              </Grid>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>

              {/* Havest */}

              <Grid item xs={12}>
                <Typography color="textSecondary">Pending reward</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  Reward: <b style={{ color: "#ff3122" }}>{
                    // ssjs.undecimalize(debt?.debt || 0, mint.decimals)
                    this.calculateReward(pool, debt)
                  }</b> SEN
                </Typography>
              </Grid>
              <Grid item xs={4} align="end">
                <Button variant="contained" color="primary" onClick={this.handleHarvest}>
                  Harvest
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Drain size={1} />
              </Grid>
              <Grid item xs={12}>
                <Typography color="textSecondary">Stake / Unstake</Typography>
              </Grid>

              {/* Stake + unStake */}
              <Grid item xs={12}>
                <Typography>
                  LP token: <b style={{ color: "#ff3122" }}>{ssjs.undecimalize(account.amount, mint.decimals)}</b>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Grid container alignItems="center">
                  <Grid item xs={3}>
                    <MintAvatar icon={icon} />
                  </Grid>
                  <Grid item xs={9}>
                    <Typography color="textSecondary">{name || "UNKNOWN"}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  variant="contained"
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
                />
              </Grid>
              <Grid item xs={4} align="end">
                {stakeLoading ? (
                  <Button variant="contained" color="primary">
                    Stake <CircularProgress size={16} />
                  </Button>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => this.handleStake("stake")}>
                    Stake
                  </Button>
                )}
                {unStakeLoading ? (
                  <Button color="primary">UnStake</Button>
                ) : (
                  <Button color="primary" onClick={() => this.handleStake("unstake")}>
                    UnStake
                  </Button>
                )}
              </Grid>
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
