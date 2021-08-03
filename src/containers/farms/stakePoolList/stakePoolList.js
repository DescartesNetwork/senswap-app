import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

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
      harvestLoading: false,
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
  }

  onClose = () => {
    return this.setState({
      poolDetail: {},
      stakeLoading: false,
      unStakeLoading: false,
      visible: false,
      loading: false,
    });
  }

  onHandleStake = (msg) => {
    // Set backlock on handle stake
    this.setState({ loading: true, loadingMessage: msg });
  }

  onOpenDetail = async (stakePool) => {
    if (!stakePool) return;
    const { mint_token: { address: mintAddress } } = stakePool;
    const {
      wallet: { user: { address: userAddress } },
      setError, getAccountData
    } = this.props;
    const params = { userAddress, getAccountData, mintAddress };
    try {
      const account = await farm.fetchAccountData(params);
      const debt = await farm.fetchDebtData(stakePool.address);
      const poolDetail = {
        pool: stakePool,
        account,
        mint: account.mint,
        debt,
      };
      this.setState({ visible: true, poolDetail: poolDetail });
    } catch (err) {
      setError(err);
    }
  }

  onOpenSeed = async (stakePool) => {
    if (!stakePool) return;
    const { mint_token: { address: mintAddress } } = stakePool;
    const {
      wallet: { user: { address: userAddress } },
      setError, getAccountData
    } = this.props;
    const { sol: { senAddress } } = configs;
    const params = { userAddress, getAccountData, mintAddress };
    // Amount is availabel of Sen wallet
    try {
      const { address: senWallet, amount } = await sol.scanAccount(senAddress, userAddress);
      const account = await farm.fetchAccountData(params);
      const debt = await farm.fetchDebtData(stakePool.address);
      const poolDetail = {
        pool: stakePool, account,
        mint: account.mint, debt,
        amount, senWallet,
      };
      this.setState({ visibleSeed: true, poolDetail: poolDetail });
    } catch (err) {
      setError(err);
    }
  }

  onCloseSeed = () => {
    this.setState({
      visibleSeed: false,
      poolDetails: [],
    });
  }

  render() {
    const { classes, stakePool } = this.props;
    const stakePools = Object.values(stakePool) || [];

    const {
      visible, poolDetail, loadingMessage,
      loading, visibleSeed,
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
        onHandleStake={this.onHandleStake}
      />
      {/* Modal seed - admin only */}
      <Seed
        visible={visibleSeed}
        onClose={this.onCloseSeed}
        detail={poolDetail}
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
