import React, { Component } from 'react';
import { connect, useSelector } from 'react-redux';
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
import CircularProgress from 'senswap-ui/circularProgress';

import configs from 'configs';
import sol from 'helpers/sol';

import Modal from './modal';

import styles from './styles';

const LITE_FARMING = new ssjs.LiteFarming();


const DECIMAL = 1;
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
        { label: '', key: 'action' },
      ],
      data: [],
      visible: false,
      modalData: [],
      stakeLoading: false,
      unStakeLoading: false,
      loading: false,
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
      visible: false
    });
  }
  onOpen = (data) => {
    if (!data) return;
    this.setState({ visible: true });
    this.setState({ modalData: data });
    console.log(LITE_FARMING, 'lite farming')
  }

  onHandleStake = async (amount, address, type) => {
    const { wallet: { user: { address: userAddress } } } = this.props;
    const { modalData: { address: stakePoolAddress } } = this.state;
    const { sol: { senAddress } } = configs;
    const { address: LPAddress } = await sol.scanAccount(address, userAddress);
    const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
    const reserveAmount = ssjs.decimalize(amount, DECIMAL);
    const data = {
      reserveAmount, stakePoolAddress,
      LPAddress, senWallet
    }
    if (type === 'unstake') return this.unstake(data)
    return this.stake(data)

  }

  stake = async (data) => {
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
    this.setState({ loading: true });
    const { modalData: { address: stakePoolAddress } } = this.state;
    const { wallet: { user: { address: userAddress } } } = this.props;
    const wallet = window.senswap.wallet;
    const { sol: { senAddress } } = configs;
    try {
      const { address: senWallet } = await sol.scanAccount(senAddress, userAddress);
      const harvest = await LITE_FARMING.harvest(stakePoolAddress, senWallet, wallet);
      console.log(harvest, 'harvest');
      await setSuccess('Harvest successfully');
      this.setState({ loading: false }, () => {
        this.fetchData();
        this.onClose();
      })
    } catch (err) {
      await setError(err);
    }

  }

  render() {
    const { classes } = this.props;
    const { fields, data, visible, modalData, stakeLoading, unStakeLoading, loading } = this.state;

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
                    <TableCell>{total_shares.toString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => this.onOpen(e)}>Farming</Button>
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
      <Modal
        visible={visible}
        onClose={this.onClose}
        stakeLoading={stakeLoading}
        unStakeLoading={unStakeLoading}
        modalData={modalData}
        onHandleStake={this.onHandleStake}
        onHandleHarvest={this.onHandleHarvest}
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
}, dispatch);

StakePool.propTypes = {
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(StakePool)));