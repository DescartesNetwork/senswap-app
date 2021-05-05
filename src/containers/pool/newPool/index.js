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
import Divider from 'senswap-ui/divider';
import Paper from 'senswap-ui/paper';

import { CloseRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar, AccountSelection } from 'containers/wallet';
import Price from './price';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { addPool } from 'modules/pool.reducer';
import { updateWallet, unlockWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  txId: '',
  loading: false,
}

class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      accountData: [{}, {}, {}],
      index: 0,
      amounts: ['', '', ''],
      visibleAccountSelection: false,
    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts } } = prevProps;
    const { wallet: { accounts } } = this.props;
    if (!isEqual(prevAccounts, accounts)) this.fetchData();
  }

  fetchData = () => {
    const { sol: { senAddress } } = configs;
    const {
      wallet: { accounts },
      setError, getAccountData, getMints, getMint,
    } = this.props;
    const { accountData } = this.state;
    let newAccountData = [...accountData];

    return getMints({ address: senAddress }).then(([{ _id }]) => {
      return getMint(_id);
    }).then(data => {
      newAccountData[0] = { mint: { ...data } }
      return Promise.all(accounts.map(accountAddress => getAccountData(accountAddress)));
    }).then(data => {
      const senData = data.filter(({ mint: { address } }) => (address === senAddress))[0];
      if (!senData) return;
      newAccountData[0] = senData;
      return this.setState({ accountData: newAccountData });
    }).catch(er => {
      return setError(er);
    });
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

  onAmount = (index, e) => {
    const amount = e.target.value || '';
    const { amounts } = this.state;
    let newAmounts = [...amounts];
    newAmounts[index] = amount;
    return this.setState({ amounts: newAmounts });
  }

  onMax = () => {
    const { accountData: { amount: balance, mint } } = this.state;
    const { decimals } = mint || {};
    const amount = ssjs.undecimalize(balance, decimals);
    return this.setState({ amount });
  }

  newPool = () => {
    const {
      accountData: { address: srcAddress, state, mint },
      networkData: { address: networkAddress },
      amount
    } = this.state;
    const { wallet: { user, lpts }, setError, updateWallet, unlockWallet, addPool } = this.props;
    const { address: mintAddress, decimals } = mint || {};
    if (!state) return setError('Please wait for data loaded');
    if (!amount) return setError('Invalid amount');

    let poolAddress = '';
    let txId = '';
    let secretKey = null;
    let pool = null;
    let treasury = ssjs.createAccount();
    let lpt = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return ssjs.createStrictAccount(this.swap.swapProgramId);
      }).then(re => {
        pool = re;
        poolAddress = pool.publicKey.toBase58();
        return sol.scanLPT(poolAddress, secretKey);
      }).then(({ nextLPT }) => {
        lpt = nextLPT;
        const reserve = ssjs.decimalize(amount, decimals);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.initializePool(
          reserve,
          0n,
          networkAddress,
          pool,
          treasury,
          lpt,
          srcAddress,
          mintAddress,
          payer
        );
      }).then(re => {
        txId = re;
        const lptAddress = lpt.publicKey.toBase58();
        const newPools = [...user.pools];
        if (!newPools.includes(poolAddress)) newPools.push(poolAddress);
        const newLPTs = [...lpts];
        if (!newLPTs.includes(lptAddress)) newLPTs.push(lptAddress);
        return updateWallet({ user: { ...user, pools: newPools }, lpts: newLPTs });
      }).then(re => {
        return addPool({ address: poolAddress });
      }).then(re => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  renderSENRole = () => {
    return <Grid item xs={12}>
      <Typography>SEN Token is required. <span style={{ color: '#808191' }}>A pool in SenSwap is a trilogy in which SEN plays the role of middle man to reduce fee, leverage routing, and realize DAO.</span></Typography>
    </Grid>
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, amounts, accountData, visibleAccountSelection } = this.state;

    const { address, mint } = accountData[0];
    const { icon: senIcon, symbol: senSymbol } = mint || {}
    const havingSen = ssjs.isAddress(address);

    return <Fragment>
      <Dialog open={visible} onClose={onClose} fullWidth>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <Typography variant="subtitle1">New pool</Typography>
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
                    <Typography>Explain how to get SEN here</Typography>
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
            {accountData.map((data, index) => {
              const { amount, mint } = data;
              const { symbol, icon, decimals, ticket } = mint || {}
              return <Fragment key={index}>
                <Grid item xs={12} >
                  <TextField
                    label={!index ? 'Primary Address' : `Address ${index}`}
                    variant="contained"
                    placeholder="0"
                    value={amounts[index]}
                    onChange={(e) => this.onAmount(index, e)}
                    InputProps={{
                      startAdornment: <Grid container className={classes.noWrap}>
                        <Grid item>
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
                        <Grid item style={{ paddingLeft: 0 }}>
                          <Divider orientation="vertical" />
                        </Grid>
                      </Grid>
                    }}
                    helperTextPrimary={`Available ${utils.prettyNumber(ssjs.undecimalize(amount, decimals))} ${symbol || ''}`}
                    helperTextSecondary={<Price ticket={ticket} />}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} />
              </Fragment>
            })}
            <Grid item xs={12}>
              <Drain size={1} />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={loading ? <CircularProgress size={17} /> : null}
                disabled={loading}
                fullWidth
              >
                <Typography>New pool</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} />
          </Grid>
        </DialogContent>}
      </Dialog>
      <AccountSelection
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
  setError,
  getMints, getMint,
  addPool,
  updateWallet, unlockWallet,
  getAccountData,
}, dispatch);

NewPool.defaultProps = {
  visible: false,
  onClose: () => { },
}

NewPool.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPool)));