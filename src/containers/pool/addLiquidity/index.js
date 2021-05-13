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
import Button, { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';

import { CloseRounded, ArrowDownwardRounded } from 'senswap-ui/icons';

import Field from './field';

import styles from './styles';
import oracle from 'helpers/oracle';
import utils from 'helpers/utils';
import { setError, setSuccess } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,

      index: 0,
      amounts: ['', '', ''],
      accountData: [],
      lpt: 0,
    }

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    const { visible } = this.props;
    if (visible) return this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolData: prevPoolData, visible: prevVisible } = prevProps;
    const { poolData, visible } = this.props;
    if (!isEqual(prevPoolData, poolData) && visible) return this.fetchData();
    if (!isEqual(prevVisible, visible) && visible) return this.fetchData();
    if (!isEqual(prevVisible, visible) && !visible) return this.setState({
      ...EMPTY,
      index: 0,
      amounts: ['', '', ''],
      lpt: 0
    });
  }

  fetchData = () => {
    const { poolData, wallet: { accounts }, getAccountData, setError } = this.props;
    const { mint_s, mint_a, mint_b } = poolData;
    const { address: mintAddressS } = mint_s || {}
    const { address: mintAddressA } = mint_a || {}
    const { address: mintAddressB } = mint_b || {}
    let mintAddresses = [mintAddressS, mintAddressA, mintAddressB];
    return this.setState({ loading: true }, () => {
      return accounts.each(accounAddress => {
        return getAccountData(accounAddress);
      }, { skipError: true, skipIndex: true }).then(accountData => {
        accountData = mintAddresses.map(mintAddress => {
          const [re] = accountData.filter(({ mint: { address } }) => mintAddress === address);
          return re;
        })
        return this.setState({ accountData, loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  estimateState = () => {
    const { setError, poolData } = this.props;
    const { amounts } = this.state;
    if (amounts.every(amount => !parseFloat(amount))) return this.setState({ lpt: 0 });
    const [deltaS, deltaA, deltaB] = amounts.map((amount, index) => {
      let decimals = 9;
      const { mint_s, mint_a, mint_b } = poolData;
      if (index === 0) decimals = mint_s.decimals;
      if (index === 1) decimals = mint_a.decimals;
      if (index === 2) decimals = mint_b.decimals;
      return ssjs.decimalize(amount, decimals);
    });
    const { reserve_s, reserve_a, reserve_b, mint_lpt } = poolData;
    const { supply } = mint_lpt || {}
    return oracle.rake(deltaS, deltaA, deltaB, reserve_s, reserve_a, reserve_b, supply).then(({ lpt }) => {
      lpt = ssjs.undecimalize(lpt, 9);
      return this.setState({ lpt });
    }).catch(er => {
      return setError(er);
    });
  }

  onAmount = (i, value) => {
    const { amounts } = this.state;
    let newAmounts = [...amounts];
    newAmounts[i] = value;
    return this.setState({ amounts: newAmounts }, this.estimateState);
  }

  onMax = (index) => {
    const { accountData, amounts } = this.state;
    const { amount, mint } = accountData[index] || {}
    const { decimals } = mint || {}
    let newAmounts = [...amounts];
    newAmounts[index] = ssjs.undecimalize(amount, decimals);
    return this.setState({ amounts: newAmounts }, this.estimateState);
  }

  addLiquidity = () => {
    const {
      wallet: { accounts }, poolData: { address: poolAddress },
      updateWallet, setError, setSuccess, onClose
    } = this.props;
    const { accountData, amounts } = this.state;

    if (!ssjs.isAddress(poolAddress)) return setError('Invalid pool address');

    let txId = '';
    const info = accountData.zip(amounts);
    const [[accountDataS, amountS], [accountDataA, amountA], [accountDataB, amountB]] = info;
    const { address: srcAddressS, mint: { decimals: decimalsS } } = accountDataS || { mint: { decimals: 9 } }
    const { address: srcAddressA, mint: { decimals: decimalsA } } = accountDataA || { mint: { decimals: 9 } }
    const { address: srcAddressB, mint: { decimals: decimalsB } } = accountDataB || { mint: { decimals: 9 } }
    const deltaS = ssjs.decimalize(amountS, decimalsS);
    const deltaA = ssjs.decimalize(amountA, decimalsA);
    const deltaB = ssjs.decimalize(amountB, decimalsB);

    return this.setState({ loading: true }, () => {
      return this.swap.addLiquidity(
        deltaS, deltaA, deltaB,
        poolAddress,
        srcAddressS, srcAddressA, srcAddressB,
        window.senswap.wallet
      ).then(({ txId: re, lptAddress }) => {
        txId = re;
        const newAccounts = [...accounts];
        if (!newAccounts.includes(lptAddress)) newAccounts.push(lptAddress);
        return updateWallet({ accounts: newAccounts });
      }).then(re => {
        return this.setState({ ...EMPTY, txId }, () => {
          onClose();
          return setSuccess('Add liquidity successfully', utils.explorer(txId));
        });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, amounts, accountData, lpt } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1">Add Liquidity</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Simulated Single Expossure. <span style={{ color: '#808191' }}>Instead of depositing proportionally the amount of three tokens, SSE allows you to deposit even one token. The pool will automatically re-balance itself.</span></Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>Liquidity provider incentive. <span style={{ color: '#808191' }}>Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span></Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain size={2} />
          </Grid>
          {accountData.map((data, index) => <Grid item key={index} xs={12}>
            <Field
              accountData={data}
              value={amounts[index]}
              onChange={value => this.onAmount(index, value)}
            />
          </Grid>
          )}
          {lpt ? <Fragment>
            <Grid item xs={12}>
              <Grid container justify="center">
                <Grid item>
                  <IconButton size="small">
                    <ArrowDownwardRounded />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Grid container className={classes.noWrap} alignItems="center">
                  <Grid item className={classes.stretch}>
                    <Typography>Total LPT</Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">{utils.prettyNumber(lpt)}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Fragment> : null}
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={loading ? <CircularProgress size={17} /> : null}
              onClick={this.addLiquidity}
              disabled={loading || amounts.every(e => !parseFloat(e))}
              fullWidth
            >
              <Typography>Deposit</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  updateWallet,
  getAccountData,
}, dispatch);

AddLiquidity.defaultProps = {
  visible: false,
  poolData: {},
  onClose: () => { },
}

AddLiquidity.propTypes = {
  visible: PropTypes.bool,
  poolData: PropTypes.object,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));