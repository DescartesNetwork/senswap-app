import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import numeral from 'numeral';
import { Skeleton } from '@material-ui/lab';
import ssjs from 'senswapjs';
import sol from 'helpers/sol';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';
import Button from 'senswap-ui/button';
import FarmingModal from 'containers/farms/farming';

import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getAccountData } from 'modules/bucket.reducer';
import CircularProgress from 'senswap-ui/circularProgress';

import styles from './styles';

const FARMING = {
  FToken: '20,2902',
  APR: '10%',
  APY: '80%',
  reward: 1.24,
  staked: 5.22
}

const LIMIT = 9999;
const LITE_FARMING = new ssjs.LiteFarming();
class Farming extends Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      data: [],
      modalData: [],
      stakeLoading: false,
      unStakeLoading: false,
      loading: false,
    }
    this.harvestRef = createRef();
    this.stakeRef = createRef();
  }

  componentDidMount() {
    this.fecthData();
  }

  fecthData = async () => {
    const { getStakePools } = this.props;
    this.setState({ loading: true });
    try {
      let res = await getStakePools(undefined, LIMIT);
      if (!res) return;
      const promise = res.map(({ address }) => {
        return LITE_FARMING.getStakePoolData(address);
      });
      await Promise.all(promise).then(mints => {
        res = [...mints];
      });
      this.setState({ data: res, loading: false });
    } catch (err) {
      await setError(err);
    }
  }

  onHandleHarvest = () => {
    const value = this.harvestRef.current.value;
    if (!value) return;
    console.log(value, 'harvest');
  }
  onHandleStake = () => {
    const value = this.stakeRef.current.value;
    if (!value) return;
    console.log(value, 'stake');
  }

  onClose = () => {
    return this.setState({
      modalData: [],
      stakeLoading: false,
      unStakeLoading: false,
      visible: false
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

  render() {
    const { classes } = this.props;
    const { visible, modalData, stakeLoading, unStakeLoading, data } = this.state;

    return <Paper className={classes.paper}>
      <Grid container alignItems="center">
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Farming</Typography>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Typography color="textSecondary">Your FToken</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3">
              {FARMING.FToken}
              <span style={{ fontSize: 20 }}>FT</span>
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Pending reward</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">Reward: {FARMING.reward} SEN</Typography>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body2">Your staked: {FARMING.staked} FT</Typography>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => this.onOpen()}
            fullWidth
          >
            Start Farming
            </Button>
        </Grid>
      </Grid>
      <FarmingModal
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
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Farming)));