import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import sol from 'helpers/sol';
import configs from 'configs';
import numeral from 'numeral';

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

import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import Utils from 'helpers/utils';
import { getStakePoolData, getAccountData, getPoolData } from 'modules/bucket.reducer';

import styles from './styles';
import accounts from 'containers/wallet/assets/accounts';

const liteFarming = new ssjs.LiteFarming();

class Farming extends Component {
  constructor() {
    super();

    this.state = {
      maxToken: 0,
      stakePoolAddress: '',
      stakePools: [],
      debt: {},
      account: {},
      stakeLoading: false,
      unStakeLoading: false,
      harvestLoading: false,
    };
    this.stakeRef = createRef();
  }
  componentDidMount() {
    this.fecthStakePools();
  }

  fecthStakePools = async () => {
    const {
      getStakePoolData, getStakePools,
      poolData: { mint_lpt: { address: mintAddress } },
    } = this.props;
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
    const wallet = window.senswap.wallet;
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
    const value = this.stakeRef.current.value;
    if (!value) return setError('Amount is required');
    const {
      sol: { senAddress },
    } = configs;
    const { address: LPAddress } = await sol.scanAccount(mintAddress, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(value, 9);
    const data = {
      reserveAmount,
      stakePoolAddress,
      LPAddress,
      senWallet,
    };
    if (type === 'unstake') return this.unstake(data);
    return this.stake(data);
  };

  stake = async (data) => {
    const { setError, setSuccess } = this.props;
    const wallet = window.senswap.wallet;
    this.setState({ stakeLoading: true, loadingMessage: 'Wait for staking' });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
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
      this.setState({ stakeLoading: false });
    }
  };

  unstake = async (data) => {
    const { setError, setSuccess } = this.props;
    this.setState({ unStakeLoading: true, loadingMessage: 'Wait for unstaking' });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      await liteFarming.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      await setSuccess('The token has been unstaked!');
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ unStakeLoading: false });
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
    const wallet = window.senswap.wallet;
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

  getMaxToken = () => {
    const { account: { amount, mint: { decimals } } } = this.state;

    const share = ssjs.undecimalize(amount, decimals);
    return this.setState({ maxToken: share });
  };

  onChange = () => {
    const value = this.stakeRef.current.value;
    this.setState({ maxToken: value });
  };

  render() {
    const {
      maxToken, stakePoolAddress, debt,
      stakeLoading, unStakeLoading, harvestLoading
    } = this.state;
    const { classes, bucket, poolData } = this.props;
    const pool = bucket[stakePoolAddress];
    const { mint_lpt: mint } = poolData;
    // //Render Stake Pool Element
    if (!pool) return null;
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
      <Paper className={classes.paper}>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Yeild Farming</Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>

          {/* Harvest */}
          <Grid item xs={12}>
            <Typography color="textSecondary">Pending reward</Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.formPaper}>
              <Grid container alignItems="flex-end">
                <Grid item xs={12} md={6}>
                  <Grid container>
                    <Grid item>
                      <Typography color="textSecondary" variant="body2">Reward:</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">
                        <b style={{ color: '#ff3122' }}>{numeral(Farm.calculateReward(pool, debt)).format('0.[0]a')}</b> SEN
                          </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container justify="flex-end">
                    <Grid item>
                      <Typography color="textSecondary" variant="body2">Period:</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">{numeral(pool.period).format('0,0')} second</Typography>
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
                      <Typography color="textSecondary" variant="body2">Total shares:</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">
                        {pool && pool.total_shares ? ssjs.undecimalize(pool.total_shares, pool.mint_token.decimals) : 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container justify="flex-end" alignItems="flex-end">
                    <Grid item>
                      <Typography color="textSecondary" variant="body2">Your LPT:</Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="body2">{numeral(lpt).format('0.[0]')} ({numeral(portion).format('0.[0][0]')}%)</Typography>
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => this.handleStake('stake')} fullWidth
                    disabled={stakeLoading}
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
                    disabled={unStakeLoading}
                    startIcon={unStakeLoading ? <CircularProgress size={17} /> : null}
                  >
                    Unstake
                      </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
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
      getStakePoolData,
      getAccountData,
      getPoolData
    },
    dispatch,
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Farming)));
