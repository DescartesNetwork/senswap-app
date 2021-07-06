import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Button from 'senswap-ui/button';
import Paper from 'senswap-ui/paper';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import { HelpOutlineRounded } from 'senswap-ui/icons';
import Typography from 'senswap-ui/typography';

import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getAccountData, getStakePoolData } from 'modules/bucket.reducer';
import CircularProgress from 'senswap-ui/circularProgress';
import { getPools, getPool } from 'modules/pool.reducer';

import configs from 'configs';
import sol from 'helpers/sol';

import Farming from '../stakePoolDetail/stakePoolDetail';
import Seed from '../seed';
import styles from '../styles';
import StakePoolItem from './stakePoolItem';

const liteFarming = new ssjs.LiteFarming();
const farming = new ssjs.Farming();
const COLS = [
  { label: '#', key: '' },
  { label: 'Assets', key: 'assets' },
  { label: 'Address', key: 'address' },
  { label: 'APR', key: 'apr' },
  { label: 'APY', key: 'apy' },
  { label: 'Liquidity', key: 'total_value' },
  { label: '', key: 'detail' },
  { label: '', key: 'seed' },
];

const DECIMAL = 9;
const LIMIT = 9999;

class StakePool extends Component {
  constructor() {
    super();

    this.state = {
      stakePools: [],
      visible: false,
      poolDetail: [],
      stakeLoading: false,
      unStakeLoading: false,
      loading: false,
      visibleSeed: false,
    };
  }
  componentDidMount() {
    this.fetchStakePools();
  }

  fetchStakePools = async () => {
    const { getStakePools, getStakePoolData } = this.props;
    this.setState({ loading: true });
    try {
      let poolAddresses = await getStakePools({}, LIMIT);
      //Fetch data from blockchain
      const promise = poolAddresses.map(({ address }) => {
        return getStakePoolData(address); //liteFarming.getStakePoolData(address);
      });
      let poolData = await Promise.all(promise);
      this.setState({ stakePools: poolData, loading: false });
    } catch (er) {
      await setError(er);
    }
  };

  onClose = () => {
    return this.setState({
      poolDetail: {},
      stakeLoading: false,
      unStakeLoading: false,
      visible: false,
    });
  };

  onOpenDetail = async (stakePool) => {
    if (!stakePool) return;
    const {
      mint_token: { address: mintAddress },
    } = stakePool;
    const wallet = window.senswap.wallet;
    const account = await this.fetchAccountData(mintAddress, wallet);
    const debt = await this.fetchDebtData(stakePool.address);
    const poolDetail = {
      pool: stakePool,
      account,
      mint: account.mint,
      debt,
    };
    this.setState({ visible: true, poolDetail: poolDetail });
  };

  fetchDebtData = async (poolAddress) => {
    const wallet = window.senswap.wallet;
    let accountData = null;
    try {
      accountData = await liteFarming.getStakeAccountData(poolAddress, wallet);
    } catch (error) {}
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

  handleStake = async (amount, address, type) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const {
      sol: { senAddress },
    } = configs;
    const { address: LPAddress } = await sol.scanAccount(address, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
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
    const wallet = window.senswap.wallet;
    this.setState({ stakeLoading: true });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      //Check Stake Pool Account
      let accountData = null;
      try {
        accountData = await liteFarming.getStakeAccountData(stakePoolAddress, wallet);
      } catch (error) {
        accountData = await liteFarming.initializeAccount(stakePoolAddress, wallet);
      }
      if (!accountData) return;
      //Stake
      console.log(
        'amount, stakePoolAddress, LPAddress, senWallet, wallet',
        amount,
        stakePoolAddress,
        LPAddress,
        senWallet,
        wallet,
      );
      await liteFarming.stake(amount, stakePoolAddress, LPAddress, senWallet, wallet);
      await setSuccess('The token has been staked!');
      this.setState({ stakeLoading: false }, () => {
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  };
  unstake = async (data) => {
    this.setState({ unStakeLoading: true });
    const { reserveAmount: amount, stakePoolAddress, LPAddress, senWallet } = data;
    try {
      const result = await liteFarming.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      await setSuccess('The token has been unstaked!');
      this.setState({ unStakeLoading: false }, () => {
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  };

  onHandleHarvest = async () => {
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const wallet = window.senswap.wallet;
    const {
      sol: { senAddress },
    } = configs;
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      await liteFarming.harvest(stakePoolAddress, senWallet, wallet);
      await setSuccess('Harvest successfully');
      this.onClose();
    } catch (err) {
      await setError(err);
    }
  };

  onHandleSeed = async (amount, type) => {
    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const {
      sol: { senAddress },
    } = configs;
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount,
      stakePoolAddress,
      senWallet,
    };

    if (type === 'unseed') return this.unseed(data);
    return this.seed(data);
  };

  seed = async (data) => {
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const { reserveAmount: amount, stakePoolAddress, senWallet } = data;
    try {
      this.setState({ seedLoading: true });
      const seed = await liteFarming.seed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
      });

      await setSuccess('Successfully');
    } catch (err) {
      await setError(err);
    }
  };
  unseed = async (data) => {
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const { reserveAmount: amount, stakePoolAddress, senWallet } = data;
    try {
      this.setState({ unSeedLoading: true });
      const seed = await liteFarming.unseed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
      });

      await setSuccess('Successfully');
    } catch (err) {
      await setError(err);
    }
  };

  onOpenSeed = async (stakePool) => {
    if (!stakePool) return;
    const {
      mint_token: { address: mintAddress },
    } = stakePool;
    const wallet = window.senswap.wallet;

    const account = await this.fetchAccountData(mintAddress, wallet);
    const debt = await this.fetchDebtData(stakePool.address);
    const poolDetail = {
      pool: stakePool,
      account,
      mint: account.mint,
      debt,
    };
    this.setState({ visibleSeed: true, poolDetail: poolDetail });
  };
  onCloseSeed = () => {
    this.setState({
      visibleSeed: false,
      poolDetails: [],
    });
  };

  render() {
    const { classes } = this.props;
    const {
      stakePools,
      visible,
      poolDetail,
      stakeLoading,
      unStakeLoading,
      loading,
      visibleSeed,
      seedLoading,
      unSeedLoading,
    } = this.state;

    return (
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow style={{ borderBottom: '1px solid #dadada' }}>
                    {COLS.map((e, idx) => {
                      return <TableCell key={idx}>{e.label}</TableCell>;
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakePools.map((pool, idx) => {
                    return (
                      <StakePoolItem
                        stakePool={pool}
                        key={idx}
                        index={idx}
                        onOpenDetail={this.onOpenDetail}
                        onOpenSeed={this.onOpenSeed}
                      ></StakePoolItem>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
                          <AvatarGroup>
        </Grid>
        {/* Modal farming */}
        <Farming
          visible={visible}
          onClose={this.onClose}
          stakeLoading={stakeLoading}
          unStakeLoading={unStakeLoading}
          detail={poolDetail}
          onHandleStake={this.handleStake}
          onHandleHarvest={this.onHandleHarvest}
        />
        {/* Modal seed - admin only */}
        <Seed
          visible={visibleSeed}
          onClose={this.onCloseSeed}
          detail={poolDetail}
          seedLoading={seedLoading}
          unSeedLoading={unSeedLoading}
          onHandleSeed={this.onHandleSeed}
        />
      </Grid>
      // </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
  stakePool: state.stakePool
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setError,
      setSuccess,
      getStakePools,
      getAccountData,
      getPools,
      getPool,
      getStakePoolData,
    },
    dispatch,
  );

StakePool.propTypes = {};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StakePool)));
