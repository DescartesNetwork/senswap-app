import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Button from 'senswap-ui/button';
import Paper from 'senswap-ui/paper';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getAccountData } from 'modules/bucket.reducer';
import CircularProgress from 'senswap-ui/circularProgress';

import configs from 'configs';
import sol from 'helpers/sol';

import Farming from './farming';
import Seed from './seed';

import styles from './styles';

const LITE_FARMING = new ssjs.LiteFarming();


const DECIMAL = 9;
const LIMIT = 9999;
const FARMING = new ssjs.Farming();
class StakePool extends Component {
  constructor() {
    super();

    this.state = {
      fields: [
        { label: '#', key: '' },
        { label: 'Address', key: 'address' },
        { label: 'Pending Reward', key: 'pending_reward' },
        { label: 'APR', key: 'apr' },
        { label: 'APY', key: 'apy' },
        { label: 'Total Shares', key: 'total_value' },
        { label: '', key: 'stake' },
        { label: '', key: 'seed' },
      ],
      data: [],
      visible: false,
      modalData: [],
      stakeLoading: false,
      unStakeLoading: false,
      loading: false,
      visibleSeed: false,
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData = async () => {
    const { getStakePools } = this.props;
    this.setState({ loading: true });
    try {
      let res = await getStakePools(undefined, LIMIT);
      if (!res) return;
      const promise = res.map(({ address }) => {
        return LITE_FARMING.getStakePoolData(address);
      });
      await Promise.all(promise).then(mints => {
        res = [...mints]
      });
      const newMints = await this.filterDebtData(res);
      this.setState({ data: newMints, loading: false });
    } catch (er) {
      await setError(er);
    }
  }
  filterDebtData = async (data) => {
    const { wallet } = this.props;
    if (!data && !wallet && wallet.stakeAccounts) return;
    const stakeAccounts = wallet.stakeAccounts;
    const promiseDebt = stakeAccounts.map(address => {
      return FARMING.getDebtData(address);
    });
    const debt = await Promise.all(promiseDebt);
    debt.forEach((e, idx) => {
      const { stake_pool: { address }, debt } = e;
      const index = data.findIndex(({ address: mintAddress }) => mintAddress === address);
      data[index].debt = debt;
    });
    return data;
  }
  onClose = () => {
    return this.setState({
      modalData: [],
      stakeLoading: false,
      unStakeLoading: false,
      seedLoading: false,
      unSeedLoading: false,
      visible: false,
    });
  }
  onOpen = async (data) => {
    if (!data) return;
    const { mint_token: { address: mintAddress } } = data;
    const mint = await this.onAccountData(mintAddress);
    data.mint_details = mint;
    this.setState({ visible: true, modalData: data });
  }

  onAccountData = async (mintAddress) => {
    const { wallet: { user: { address: userAddress } }, getAccountData } = this.props;
    if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
    if (!ssjs.isAddress(userAddress)) throw new Error('Invalid wallet address');
    const { address: accountAddress, state } = await sol.scanAccount(mintAddress, userAddress);
    if (!state) throw new Error('Invalid state');
    const { mint } = await getAccountData(accountAddress);
    if (mint) return mint;
  }

  onHandleStake = async (amount, address, type) => {
    const { wallet: { user: { address: userAddress } } } = this.props;
    const { modalData: { address: stakePoolAddress } } = this.state;
    const { sol: { senAddress } } = configs;
    const { address: LPAddress } = await sol.scanAccount(address, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    console.log(await sol.scanAccount(address, userAddress), await sol.scanAccount(senAddress, userAddress), 'decimal')
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount, stakePoolAddress,
      LPAddress, senWallet
    }
    if (type === 'unstake') return this.unstake(data)
    return this.stake(data);
  }

  stake = async (data) => {
    const { setSuccess, setError } = this.props;
    const wallet = window.senswap.wallet;
    this.setState({ stakeLoading: true });
    const {
      reserveAmount: amount, stakePoolAddress,
      LPAddress, senWallet
    } = data;
    try {
      //Check Stake Pool Account
      let accountData = null;
      try {
        accountData = await LITE_FARMING.getStakeAccountData(stakePoolAddress, wallet);
      } catch (error) {
        accountData = await LITE_FARMING.initializeAccount(stakePoolAddress, wallet);
      }
      if (!accountData) return;
      //Stake
      const stake = await LITE_FARMING.stake(amount, stakePoolAddress, LPAddress, senWallet, wallet);
      console.log(stake, 'finish stake??');
      await setSuccess('The token has been staked!');
      this.setState({ stakeLoading: false }, () => {
        this.fetchData();
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  }
  unstake = async (data) => {
    const { setSuccess, setError } = this.props;
    this.setState({ unStakeLoading: true });
    const {
      reserveAmount: amount, stakePoolAddress,
      LPAddress, senWallet
    } = data;
    console.log(data, 'stake11');
    try {
      const result = await LITE_FARMING.unstake(amount, stakePoolAddress, LPAddress, senWallet, window.senswap.wallet);
      await setSuccess('The token has been unstaked!');
      this.setState({ unStakeLoading: false }, () => {
        this.fetchData();
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  }
  onHandleHarvest = async () => {
    const { modalData: { address: stakePoolAddress } } = this.state;
    const { wallet: { user: { address: userAddress } } } = this.props;
    const wallet = window.senswap.wallet;
    const { sol: { senAddress } } = configs;
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      const harvest = await LITE_FARMING.harvest(stakePoolAddress, senWallet, wallet);
      console.log(harvest, 'harvest');
      await setSuccess('Harvest successfully');
      this.fetchData();
      this.onClose();
    } catch (err) {
      await setError(err);
    }

  }

  onHandleSeed = async (amount, type) => {
    const { wallet: { user: { address: userAddress } } } = this.props;
    const { modalData: { address: stakePoolAddress } } = this.state;
    const { sol: { senAddress } } = configs;
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount, stakePoolAddress,
      senWallet
    }

    if (type === 'unseed') return this.unseed(data);
    return this.seed(data);
  }
  seed = async (data) => {
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const {
      reserveAmount: amount, stakePoolAddress,
      senWallet
    } = data;
    try {
      this.setState({ seedLoading: true });
      const seed = await LITE_FARMING.seed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
      });

      await setSuccess('Successfully');

    } catch (err) {
      await setError(err);
    }
  }
  unseed = async (data) => {
    const wallet = window.senswap.wallet;
    const { setSuccess, setError } = this.props;
    const {
      reserveAmount: amount, stakePoolAddress,
      senWallet
    } = data;
    try {
      this.setState({ unSeedLoading: true });
      const seed = await LITE_FARMING.unseed(amount, stakePoolAddress, senWallet, wallet);
      if (!seed) throw new Error('Error!');
      this.setState({ seedLoading: false }, () => {
        this.onCloseSeed();
      });

      await setSuccess('Successfully');

    } catch (err) {
      await setError(err);
    }

  }

  onOpenSeed = async (data) => {
    if (!data) return;
    const { mint_token: { address: mintAddress } } = data;
    const mint = await this.onAccountData(mintAddress);
    data.mint_details = mint;
    this.setState({ visibleSeed: true, modalData: data });
  }
  onCloseSeed = () => {
    this.setState({
      visibleSeed: false,
      modalData: []
    })
  }

  render() {
    const { classes } = this.props;
    const {
      fields, data, visible, modalData,
      stakeLoading, unStakeLoading, loading, visibleSeed,
      seedLoading, unSeedLoading
    } = this.state;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow style={{ borderBottom: '1px solid #dadada' }}>
                  {fields.map((e, idx) => {
                    return <TableCell key={idx}>{e.label}</TableCell>
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && data ? data.map((e, idx) => {
                  const { mint_token: token,
                    address: stakePoolAddress,
                    debt, total_shares } = e;
                  return <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className={classes.address}>{stakePoolAddress}</TableCell>
                    <TableCell>{ssjs.undecimalize(debt, token.decimals)}</TableCell>
                    <TableCell>{e.apr}</TableCell>
                    <TableCell>{e.apy}</TableCell>
                    <TableCell>{ssjs.undecimalize(total_shares, token.decimals)}</TableCell>
                    <TableCell>
                      <Button onClick={() => this.onOpen(e)}>Farming</Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => this.onOpenSeed(e)}>Seed</Button>
                    </TableCell>
                  </TableRow>
                }) : [1, 2, 3, 4, 5].map(e => {
                  return <TableRow key={e}>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                    <TableCell><CircularProgress size={17} /></TableCell>
                  </TableRow>
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <Farming
        visible={visible}
        onClose={this.onClose}
        stakeLoading={stakeLoading}
        unStakeLoading={unStakeLoading}
        modalData={modalData}
        onHandleStake={this.onHandleStake}
        onHandleHarvest={this.onHandleHarvest}
      />
      <Seed
        visible={visibleSeed}
        onClose={this.onCloseSeed}
        modalData={modalData}
        seedLoading={seedLoading}
        unSeedLoading={unSeedLoading}
        onHandleSeed={this.onHandleSeed}
      />
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  getStakePools,
  getAccountData,
}, dispatch);

StakePool.propTypes = {
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(StakePool)));