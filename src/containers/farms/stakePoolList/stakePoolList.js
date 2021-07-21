import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Typography from 'senswap-ui/typography';
import { Backdrop } from '@material-ui/core';

import StakePoolItem from './stakePoolItem';
import Farming from '../stakePoolDetail/stakePoolDetail';
import Seed from '../seed';

import styles from '../styles';
import configs from 'configs';
import sol from 'helpers/sol';
import farm from 'helpers/farm';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getAccountData, getStakePoolData } from 'modules/bucket.reducer';
import CircularProgress from 'senswap-ui/circularProgress';
import { getPools, getPool } from 'modules/pool.reducer';
import { updateWallet } from 'modules/wallet.reducer';

const COLS = [
  { label: '#', key: '' },
  { label: 'ASSETS', key: 'assets' },
  { label: 'APR', key: 'apr' },
  { label: 'APY', key: 'apy' },
  { label: 'LIQUIDITY', key: 'total_value' },
  { label: '', key: 'detail' },
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
      loadingMessage: '',
      loading: false,
      visibleSeed: false,
      isAccess: false,
      stakeLoading: false,
      unStakeLoading: false,
      harvestLoading: false,
      seedLoading: false,
      unSeedLoading: false,
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
    const { wallet, farming: liteFarming } = window.senswap;
    let accountData = null;
    try {
      accountData = await liteFarming.getStakeAccountData(poolAddress, wallet);
    } catch (error) {
      console.log(error);
    }
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
      updateWallet,
      wallet: {
        user: { address: userAddress },
        stakeAccounts, stakeAccount
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
    const { amountStake, amountUnstake } = amount;
    const { address: LPAddress } = await sol.scanAccount(address, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveStakeAmount = ssjs.decimalize(amountStake, DECIMAL);
    const reserveUnstakeAmount = ssjs.decimalize(amountUnstake, DECIMAL);
    const data = {
      reserveStakeAmount,
      reserveUnstakeAmount,
      stakePoolAddress,
      LPAddress,
      senWallet,
      stakeAccounts, stakeAccount,
      updateWallet,
    };
    if (type === 'unstake') {
      this.setState({ unStakeLoading: true, loadingMessage: 'Wait for unstaking' });
      const { status, msg } = await farm.unstake(data);
      if (status) await setSuccess('Success');
      if (!status) await setError('Fail');
      console.log(msg);
      return this.setState({ unStakeLoading: false }, () => {
        this.onClose();
      });
    }
    this.setState({ stakeLoading: true, loadingMessage: 'Wait for staking' });
    const { status, msg } = await farm.stake(data);
    if (status) setSuccess(msg);
    if (!status) setError(msg);
    return this.setState({ unStakeLoading: false }, () => {
      this.onClose();
    });
  };

  onHandleHarvest = async () => {
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
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
    } catch (err) {
      await setError(err);
    } finally {
      this.setState({ harvestLoading: false }, () => {
        this.onClose();
      });
    }
  };

  onHandleSeed = async (data, type) => {
    const {
      poolDetail: {
        pool: { address: stakePoolAddress },
      },
    } = this.state;
    const { amount, senWallet } = data;
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
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
        this.onCloseSeed();
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
        this.onCloseSeed();
      });
    }
  };

  onOpenSeed = async (stakePool) => {
    if (!stakePool) return;
    const {
      mint_token: { address: mintAddress },
    } = stakePool;
    const wallet = window.senswap.wallet;

    const {
      wallet: {
        user: { address: userAddress },
      },
    } = this.props;
    const {
      sol: { senAddress },
    } = configs;
    // Amount is availabel of Sen wallet
    const { address: senWallet, amount } = await sol.scanAccount(senAddress, userAddress);

    const account = await this.fetchAccountData(mintAddress, wallet);
    const debt = await this.fetchDebtData(stakePool.address);
    const poolDetail = {
      pool: stakePool,
      account,
      mint: account.mint,
      debt,
      amount,
      senWallet,
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
    const { classes, stakePool } = this.props;
    const stakePools = Object.values(stakePool) || [];

    const {
      visible, poolDetail, loadingMessage, loading, visibleSeed, seedLoading, unSeedLoading,
      harvestLoading, stakeLoading, unStakeLoading
    } = this.state;

    return <Grid container>
      <Backdrop className={classes.backdrop} open={loading} transitionDuration={500}>
        <Grid container spacing={2} justify="center">
          <Grid item>
            <CircularProgress color="primary" />
          </Grid>
          <Grid item xs={12}>
            <Typography align="center">{loadingMessage}</Typography>
          </Grid>
        </Grid>
      </Backdrop>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow style={{ borderBottom: '1px solid #dadada' }}>
                {COLS.map((e, idx) => {
                  return <TableCell key={idx}>
                    <Typography color="textSecondary" variant="caption">{e.label}</Typography>
                  </TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {stakePools.map((pool, idx) => {
                return <StakePoolItem
                  stakePool={pool}
                  key={idx}
                  index={idx}
                  onOpenDetail={this.onOpenDetail}
                  onOpenSeed={this.onOpenSeed}
                ></StakePoolItem>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      {/* Modal farming */}
      <Farming
        visible={visible}
        onClose={this.onClose}
        detail={poolDetail}
        onHandleStake={this.handleStake}
        onHandleHarvest={this.onHandleHarvest}
        stakeLoading={stakeLoading}
        unStakeLoading={unStakeLoading}
        harvestLoading={harvestLoading}
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
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
  stakePool: state.stakePool,
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
      updateWallet
    },
    dispatch,
  );

StakePool.propTypes = {};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(StakePool)));
