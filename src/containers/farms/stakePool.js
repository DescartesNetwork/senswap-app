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

import configs from 'configs';
import sol from 'helpers/sol';

import Modal from './modal';

import styles from './styles';

const LITE_FARMING = new ssjs.LiteFarming();


const DECIMAL = 1;
const LIMIT = 9999;
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
    };
  }
  componentDidMount() {
    this.fetchData();
  }
  fetchData = async () => {
    const { getStakePools } = this.props;
    try {
      let res = await getStakePools(undefined, LIMIT);
      if (!res) return;
      const mints = res.map(({ address }) => {
        return LITE_FARMING.getStakePoolData(address);
      });
      await Promise.all(mints).then(mint => {
        res = [...mint]
      });
      console.log(res, 'data');
      this.setState({ data: res });
    } catch (er) {
      await setError(er);
    }
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
    console.log(senWallet, 'senWallet')
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
      if(!accountData) return;
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
      console.log(result, 'stake??');
      await setSuccess('The token has been unstaked!');
      this.setState({ unStakeLoading: false }, () => {
        this.fetchData();
        this.onClose();
      });
    } catch (err) {
      await setError(err);
    }
  }
  onHandleHarvest = (value) => {
    console.log(value, 'stake')
  }

  render() {
    const { classes } = this.props;
    const { fields, data, visible, modalData, stakeLoading, unStakeLoading } = this.state;

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
                {data ? data.map((e, idx) => {
                  return <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className={classes.address}>{e.address}</TableCell>
                    <TableCell>{e.pendingReward}</TableCell>
                    <TableCell>{e.apr}</TableCell>
                    <TableCell>{e.apy}</TableCell>
                    <TableCell>{e.total_shares.toString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => this.onOpen(e)}>Farming</Button>
                    </TableCell>
                  </TableRow>
                }) : null}
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