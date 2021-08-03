import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import numeral from 'numeral';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Paper from 'senswap-ui/paper';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import { Skeleton } from '@material-ui/lab';
import Divider from 'senswap-ui/divider';

import configs from 'configs';
import sol from 'helpers/sol';
import farm from 'helpers/farm';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getStakePoolData, getAccountData, getPoolData } from 'modules/bucket.reducer';

import styles from './styles';


class Farming extends Component {
  constructor() {
    super();

    this.state = {
      stakePoolAddress: '',
      stakePools: [],
      debt: {},
      account: {},
      loading: false,
      stakeLoading: false,
      unStakeLoading: false,
      harvestLoading: false,
      maxStake: '',
      maxUnstake: '',
      disableStake: false,
      disableUnstake: false,
    };
    this.stakeRef = createRef();
    this.unstakeRef = createRef();
  }

  componentDidMount() {
    this.fecthStakePool();
  }

  componentDidUpdate(prevProps) {
    const { stakePoolAddress: address } = this.state;
    const { bucket: currBucket } = this.props;
    const { bucket: prevBucket } = prevProps;

    // Compare stake pool details
    if (!isEqual(currBucket[address], prevBucket[address])) return this.fecthStakePools();
  }

  fecthStakePool = async () => {
    const {
      getStakePoolData, getStakePools, getAccountData,
      poolData: { mint_lpt: { address: mintAddress } },
      wallet: { user: { address: userAddress } }
    } = this.props;
    const params = { userAddress, getAccountData, mintAddress };
    this.setState({ loading: true });
    if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
    if (!ssjs.isAddress(userAddress)) throw new Error('Invalid wallet address');
    try {
      let poolAddresses = await getStakePools({}, 9999);
      const promise = poolAddresses.map(({ address }) => {
        return getStakePoolData(address);
      });
      const stakePools = await Promise.all(promise);
      const stakePoolAddress = await farm.getStakePoolAddress({ stakePools, mintAddress });
      const debt = await farm.fetchDebtData(stakePoolAddress);
      const account = await farm.fetchAccountData(params);
      this.setState({ account: account, debt: debt, stakePoolAddress: stakePoolAddress });
    } catch (err) {
      console.log(err, 'err');
    } finally {
      this.setState({ loading: false });
    }
  }

  handleStake = async (type) => {
    const {
      wallet: { user: { address: userAddress } },
      bucket,
    } = this.props;
    const { stakePoolAddress } = this.state;
    const { mintLPT: mintAddress } = bucket[stakePoolAddress];
    const stake = this.stakeRef.current.value;
    const unstake = this.unstakeRef.current.value;
    const {
      sol: { senAddress },
    } = configs;
    const { address: LPAddress } = await sol.scanAccount(mintAddress, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveStake = ssjs.decimalize(stake, 9);
    const reserveUnstake = ssjs.decimalize(unstake, 9);
    const params = {
      reserveStake,
      reserveUnstake,
      stakePoolAddress,
      LPAddress,
      senWallet,
    };
    if (type === 'unstake') return this.unstake(params);
    return this.stake(params);
  }

  stake = async (params) => {
    const { setError, setSuccess } = this.props;
    this.setState({ stakeLoading: true });
    const { status, msg } = await farm.stake(params);
    this.setState({ stakeLoading: false, maxStake: '' }, () => {
      if (status) return setSuccess(msg);
      return setError(msg);
    });
  }

  unstake = async (params) => {
    const { setError, setSuccess } = this.props;
    this.setState({ unStakeLoading: true });
    const { status, msg } = await farm.unstake(params);
    this.setState({ unStakeLoading: false, maxUnstake: '' }, () => {
      if (status) return setSuccess(msg);
      return setError(msg)
    });
  }

  handleHarvest = async () => {
    const { stakePoolAddress } = this.state;
    const {
      setError,
      setSuccess,
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const { sol: { senAddress } } = configs;
    this.setState({ harvestLoading: true });
    const params = {
      senAddress, userAddress, stakePoolAddress
    }
    const { status, msg } = await farm.harvest(params);
    this.setState({ harvestLoading: false }, () => {
      if (status) setSuccess(msg);
      return setError(msg)
    });
  }

  getMaxToken = (type) => {
    const {
      account: {
        amount,
        mint: { decimals }
      },
      debt
    } = this.state;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const share = ssjs.undecimalize(amount, decimals);

    if (type === 'unstake') return this.setState({ maxUnstake: lpt }, () => {
      this.onUnstakeChange();
    });
    return this.setState({ maxStake: share }, () => {
      this.onStakeChange();
    });
  }

  onStakeChange = () => {
    const {
      account: {
        amount,
        mint: { decimals }
      },
    } = this.state;
    const share = Number(ssjs.undecimalize(amount, decimals));
    const value = Number(this.stakeRef.current.value);
    this.setState({ maxStake: this.stakeRef.current.value, disableStake: value > share || Math.sign(value) !== 1 });
  }

  onUnstakeChange = () => {
    const {
      account: {
        mint: { decimals }
      },
      debt
    } = this.state;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const value = Number(this.unstakeRef.current.value);
    this.setState({ maxUnstake: this.unstakeRef.current.value, disableUnstake: value > lpt || Math.sign(value) !== 1 });
  }

  render() {
    const {
      stakePoolAddress, debt,
      stakeLoading, unStakeLoading, harvestLoading,
      loading, disableStake, disableUnstake,
      maxStake, maxUnstake, account,
    } = this.state;
    const { classes, bucket, poolData } = this.props;

    const pool = bucket[stakePoolAddress];
    const { mint_lpt: mint } = poolData;
    // //Render Stake Pool Element
    if (!pool || loading) return <Skeleton variant="rect" height={600} className={classes.paper} />;
    const {
      mint_token: { decimals },
      total_shares,
      mintS: { icon: iconS, symbol: symbolS },
      mintA: { icon: iconA, symbol: symbolA },
      mintB: { icon: iconB, symbol: symbolB },
    } = pool;
    const icons = [iconA, iconB, iconS];
    const name = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const total = Number(ssjs.undecimalize(total_shares, decimals));
    const portion = total ? lpt / total * 100 : 0;

    return <Paper className={classes.paper}>
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Yeild farming</Typography>
        </Grid>
        <Drain size={1} />
        <Grid item>
          <AvatarGroup>
            {icons ? icons.map((e, idx) => {
              return <Avatar size="small" src={e} key={idx} />;
            }) : <Avatar />}
          </AvatarGroup>
        </Grid>
        <Grid item>
          <Typography color="textSecondary">{name ? name : 'UNKNOWN'}</Typography>
        </Grid>
        {/* Shares */}
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
              <Typography color="textSecondary">Your shares:</Typography>
            </Grid>
            <Grid item>
              <Typography>{numeral(lpt).format('0,0.[00]')} ({numeral(portion).format('0.[0]')}%)</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Drain size={1} />
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Drain size={1} />

        {/* Harvest */}
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">Pending reward</Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper className={classes.formPaper}>
            <Grid container alignItems="flex-end">
              <Grid item xs={12} md={8}>
                <Grid container spacing={1}>
                  <Grid item xs={3}>
                    <Typography color="textSecondary">Period:</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography>{numeral(pool.period).format('0,0')} second</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography color="textSecondary">Reward:</Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography>
                      <b style={{ color: '#ff3122' }}>{numeral(farm.calculateReward(pool, debt)).format('0.[00]')}</b> SEN
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
                  Harvest
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
                      type="number"
                      placeholder="0"
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
              <Grid item xs={8}>
                <Grid container justify="space-between" spacing={0}>
                  <Grid item>
                    <Typography variant="body2">LP Token</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="textSecondary">
                      Available: {numeral(lpt).format('0,0.[00]')} LPT</Typography>
                  </Grid>
                </Grid>
                <Grid container className={classes.outlineInput} spacing={0}>
                  <Grid item xs={12}>
                    <TextField
                      variant="standard"
                      value={maxUnstake}
                      type="number"
                      placeholder="0"
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
              <Grid item xs={4} className={classes.button}>
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
    </Paper>
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
      getStakePoolData,
      getAccountData,
      getPoolData
    },
    dispatch,
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Farming)));
