import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';

import { CloseRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';
import AccountSelection from './selection';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getMints } from 'modules/mint.reducer';
import { addStakePool } from 'modules/stakePool.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';

class NewStakePool extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      accountData: [{}, {}],
      index: 0,
      visibleAccountSelection: false,
      reward: 0,
      period: 0,
    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    const { visible } = this.props;
    if (visible) this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts }, visible: prevVisible } = prevProps;
    const { wallet: { accounts }, visible } = this.props;
    if (!isEqual(prevAccounts, accounts) && visible) this.fetchData();
    if (!isEqual(prevVisible, visible) && visible) this.fetchData();
  }

  fetchData = async () => {
    const { sol: { senAddress } } = configs;
    const {
      wallet: { user: { address: walletAddress } },
      setError, getAccountData, getMints,
    } = this.props;
    const { accountData } = this.state;
    let newAccountData = [...accountData];
    try {
      this.setState({ loading: true });
      let data = await sol.scanAccount(senAddress, walletAddress);
      const { state, address: accountAddress } = data || {}
      if (!state) {
        const mintData = await getMints(senAddress);
        data = { address: '', amount: 0n, mint: mintData };
        console.log(data, 'data');
      }
      else data = await getAccountData(accountAddress);
      newAccountData[0] = data;
      console.log(newAccountData, data, 'data');
      return this.setState({ loading: false, accountData: newAccountData });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onOpenAccountSelection = (index) => this.setState({ index, visibleAccountSelection: true });
  onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });

  onAccountData = (data) => {
    const { setError } = this.props;
    const { accountData, index } = this.state;
    if (accountData.some(({ address }) => data.address === address)) return setError('Already selected');
    let newAccountData = [...accountData];
    newAccountData[index] = data;
    return this.setState({ accountData: newAccountData }, () => {
      return this.onCloseAccountSelection();
    });
  }

  onChangeReward = (e) => {
    const reward = e.target.value || '';
    return this.setState({ reward: reward });
  }

  onChangePeriod = (e) => {
    const period = e.target.value || '';
    return this.setState({ period: period });
  }

  handleCreateStakePool = async () => {
    const liteFarming = new ssjs.LiteFarming(undefined, undefined, undefined, configs.sol.node);
    const wallet = window.senswap.wallet;
    const ownerAddress = await wallet.getAccount();
    const {
      accountData: [
        { mint: { address: srcSAddress } },
        { mint: { address: srcAAddress } },
      ],
      period,
      reward
    } = this.state;
    const {
      setError, setSuccess,
      addStakePool, onClose
    } = this.props;
    const decimal = 9;

    if (!ssjs.isAddress(srcSAddress)) return setError('Please select primary token');
    if (!ssjs.isAddress(srcAAddress)) return setError('Please select token 1');
    const reserveReward = ssjs.decimalize(reward, decimal);
    const reservePeriod = ssjs.decimalize(period, decimal);
    if (!reserveReward || !reservePeriod) return setError('Invalid amount');

    try {
      this.setState({ loading: true });
      console.log(srcSAddress, srcAAddress, 'begin stake pool')
      const data = await liteFarming.initializeStakePool(
        reserveReward, reservePeriod,
        ownerAddress, srcAAddress,
        srcSAddress, wallet
      );
      const stakePool = {
        address: data.stakePoolAddress,
        mintShare: data.mintShareAddress,
      }
      await addStakePool(stakePool);
      await setSuccess('Create a new pool successfully');
      return this.setState({ loading: false }, onClose);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }

  }

  renderSENRole = () => {
    return <Grid item xs={12}>
      <Typography>SEN Token is required. <span style={{ color: '#808191' }}>A pool in SenSwap is a trilogy in which SEN plays the role of middle man to reduce fee, leverage routing, and realize DAO.</span></Typography>
    </Grid>
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, reward, period, accountData, visibleAccountSelection } = this.state;

    const { address, mint } = accountData[0];
    const { icon: senIcon, symbol: senSymbol } = mint || {}
    const havingSen = ssjs.isAddress(address);

    return <Fragment>
      <Dialog open={visible} onClose={onClose} fullWidth>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <Typography variant="subtitle1">New stake pool</Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={onClose} edge="end">
                <CloseRounded />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        {!havingSen ? <DialogContent>
          <Grid container spacing={2}>
            {this.renderSENRole()}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Grid container className={classes.noWrap} alignItems="center">
                      <Grid item className={classes.stretch}>
                        <Typography variant="caption" color="textSecondary">HOW TO GET SEN?</Typography>
                      </Grid>
                      <Grid item>
                        <Typography>{senSymbol}</Typography>
                      </Grid>
                      <Grid item>
                        <MintAvatar icon={senIcon} />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>You can swap your tokens to get SEN on our platform.</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} />
          </Grid>
        </DialogContent> : <DialogContent>
          <Grid container spacing={2}>
            {this.renderSENRole()}
            <Grid item xs={12}>
              <Typography>Liquidity provider incentive. <span style={{ color: '#808191' }}>Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span></Typography>
            </Grid>
            <Grid item xs={12}>
              <Drain size={2} />
            </Grid>
            <Grid container className={classes.noWrap} alignItems="center">
              {accountData.map((data, index) => {
                const { amount, mint } = data;
                const { symbol, icon, decimals, ticket } = mint || {}
                return <Fragment key={index}>
                  <Grid item xs={6}>
                    <Typography color="textPrimary">Mint token {index + 1}: </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      size="small"
                      startIcon={<MintAvatar icon={icon} />}
                      endIcon={<ArrowDropDownRounded />}
                      onClick={() => this.onOpenAccountSelection(index)}
                      disabled={!index}
                    >
                      <Typography>{symbol || 'Select'} </Typography>
                    </Button>
                  </Grid>
                </Fragment>
              })}
            </Grid>
            <Grid item xs={12}>
              <Drain size={1} />
            </Grid>
            <Grid container>
              <Grid item xs={6}>
                <Typography>Reward</Typography>
                <TextField
                  variant="contained"
                  value={reward}
                  onChange={(e) => this.onChangeReward(e)}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography>Period</Typography>
                <TextField
                  value={period}
                  variant="contained"
                  onChange={(e) => this.onChangePeriod(e)}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Drain size={1} />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={this.handleCreateStakePool}
                endIcon={loading ? <CircularProgress size={17} /> : null}
                disabled={loading}
                fullWidth
              >
                <Typography>Create Stake Pool</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} />
          </Grid>
        </DialogContent>}
      </Dialog>
      <AccountSelection
        solana={false}
        visible={visibleAccountSelection}
        onClose={this.onCloseAccountSelection}
        onChange={this.onAccountData}
      />
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  pool: state.pool,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  getMints,
  addStakePool,
  updateWallet,
  getAccountData,
}, dispatch);

NewStakePool.defaultProps = {
  visible: false,
  onClose: () => { },
}

NewStakePool.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewStakePool)));