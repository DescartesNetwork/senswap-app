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
import Farm from 'helpers/farm';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import { Skeleton } from '@material-ui/lab';
import Divider from 'senswap-ui/divider';

import sol from 'helpers/sol';
import configs from 'configs';
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
      maxStake: 0,
      maxUnstake: 0,
      disableStake: false,
      disableUnstake: false,
    };
    this.stakeRef = createRef();
    this.unstakeRef = createRef();
  }

  componentDidMount() {
    this.fecthStakePools();
  }

  componentDidUpdate(prevProps) {
    const { stakePoolAddress: address } = this.state;
    const { bucket: currBucket } = this.props;
    const { bucket: prevBucket } = prevProps;

    // Compare stake pool details
    if (!isEqual(currBucket[address], prevBucket[address])) return this.fecthStakePools();
  }

  fecthStakePools = async () => {
    const {
      getStakePoolData, getStakePools,
      poolData: { mint_lpt: { address: mintAddress } },
    } = this.props;
    this.setState({ loading: true });
    try {
      let poolAddresses = await getStakePools({}, 9999);
      const promise = poolAddresses.map(({ address }) => {
        return getStakePoolData(address);
      });
      const stakePools = await Promise.all(promise);
      this.setState({ stakePools: stakePools }, async () => {
        const stakePoolAddress = await this.getStakePoolAddress();
        const debt = await this.fetchDebtData(stakePoolAddress);
        this.setState({ debt: debt });
      });
      const account = await this.fetchAccountData(mintAddress);
      this.setState({ account: account });
    } catch (err) {
      console.log(err, 'err');
    } finally {
      this.setState({ loading: false });
    }
  }

  getStakePoolAddress = async () => {
    const { poolData: {
      mint_lpt: { address: mintAddress }
    },
    } = this.props;
    const { stakePools } = this.state;
    try {
      const { address: stakePoolAddress } = stakePools.find(stakePool => stakePool.mintLPT === mintAddress || stakePool.mint_token.address === mintAddress);
      this.setState({ stakePoolAddress: stakePoolAddress });
      return stakePoolAddress;
    } catch (err) {
      console.log(err)
    }
  }

  fetchDebtData = async (poolAddress) => {
    const { wallet, farming: liteFarming } = window.senswap;
    let accountData = null;
    try {
      accountData = await liteFarming.getStakeAccountData(poolAddress, wallet);
    } catch (error) { }
    return accountData;
  };

  fetchAccountData = async (mintAddress) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
      getAccountData,
    } = this.props;
    if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
    if (!ssjs.isAddress(userAddress)) throw new Error('Invalid wallet address');
    const { address: accountAddress, state } = await sol.scanAccount(mintAddress, userAddress);
    if (!state) throw new Error('Invalid state');
    const account = await getAccountData(accountAddress);
    return account;
  };

  handleStake = async (type) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
      bucket,
    } = this.props;
    const { stakePoolAddress } = this.state;
    const { mintLPT: mintAddress } = bucket[stakePoolAddress];
    const stake = this.stakeRef.current.value;
    const unstake = this.unstakeRef.current.value;
    if (!stake) return setError('Stake amount isvalid');
    if (!unstake) return setError('Unstake amount isvalid');
    const {
      sol: { senAddress },
    } = configs;
    const { address: LPAddress } = await sol.scanAccount(mintAddress, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveStake = ssjs.decimalize(stake, 9);
    const reserveUnstake = ssjs.decimalize(unstake, 9);
    const data = {
      reserveStake,
      reserveUnstake,
      stakePoolAddress,
      LPAddress,
      senWallet,
    };
    if (type === 'unstake') return this.unstake(data);
    return this.stake(data);
  };

  stake = async (data) => {
    const { setError, setSuccess } = this.props;
    const { wallet, farming: liteFarming } = window.senswap;
    this.setState({ stakeLoading: true, loadingMessage: 'Wait for staking' });
    const { reserveStake: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      //Check Stake Pool Account
      try {
        await liteFarming.getStakeAccountData(stakePoolAddress, wallet);
      } catch (error) {
        await liteFarming.initializeAccount(stakePoolAddress, wallet);
      }
      //Stake
      await liteFarming.stake(amount, stakePoolAddress, LPAddress, senWallet, wallet);
      await setSuccess('The token has been staked!');
    } catch (err) {
      console.log('Error');
      await setError(err);
    } finally {
      this.setState({ stakeLoading: false, maxStake: 0 });
    }
  };

  unstake = async (data) => {
    const { setError, setSuccess } = this.props;
    const liteFarming = window.senswap.farming;
    this.setState({ unStakeLoading: true, loadingMessage: 'Wait for unstaking' });
    const { reserveUnstake: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      await liteFarming.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      await setSuccess('The token has been unstaked!');
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ unStakeLoading: false, maxUnstake: 0 });
    }
  };

  onHandleHarvest = async () => {
    const { stakePoolAddress } = this.state;
    const {
      setError,
      setSuccess,
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const { wallet, farming: liteFarming } = window.senswap;
    const {
      sol: { senAddress },
    } = configs;
    this.setState({ harvestLoading: true });
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      await liteFarming.harvest(stakePoolAddress, senWallet, wallet);
      await setSuccess('Harvest successfully');
      this.onClose();
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ harvestLoading: false });
    }
  };

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
  };

  onStakeChange = () => {
    const {
      account: {
        amount,
        mint: { decimals }
      },
    } = this.state;
    const share = Number(ssjs.undecimalize(amount, decimals));
    const value = Number(this.stakeRef.current.value);
    this.setState({ maxStake: this.stakeRef.current.value, disableStake: value > share || value / value !== 1 });
  };

  onUnstakeChange = () => {
    const {
      account: {
        mint: { decimals }
      },
      debt
    } = this.state;
    const lpt = Number(ssjs.undecimalize(debt?.account?.amount || 0, decimals));
    const value = Number(this.unstakeRef.current.value);
    this.setState({ maxUnstake: this.unstakeRef.current.value, disableUnstake: value > lpt || value / value !== 1 });
  };

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
