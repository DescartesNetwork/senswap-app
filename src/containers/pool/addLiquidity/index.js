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

import { CloseRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
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
    }

    this.swap = window.senswap.swap;
  }

  componentDidUpdate(prevProps) {
    const { data: prevData, visible: prevVisible } = prevProps;
    const { data, visible } = this.props;
    if (!isEqual(prevData, data) && visible) return this.fetchData();
    if (!isEqual(prevVisible, visible) && visible) return this.fetchData();
  }

  fetchData = () => {
    const { data, wallet: { accounts }, getAccountData, setError } = this.props;
    const { mint_s, mint_a, mint_b } = data;
    const { address: mintAddressS } = mint_s || {}
    const { address: mintAddressA } = mint_a || {}
    const { address: mintAddressB } = mint_b || {}
    let mintAddresses = [mintAddressS, mintAddressA, mintAddressB];
    return accounts.each(accounAddress => {
      return getAccountData(accounAddress);
    }, { skipError: true, skipIndex: true }).then(accountData => {
      accountData = mintAddresses.map(mintAddress => {
        const [re] = accountData.filter(({ mint: { address } }) => mintAddress === address);
        return re;
      })
      return this.setState({ accountData });
    }).catch(er => {
      return setError(er);
    });
  }

  onAmount = (i, e) => {
    const { amounts } = this.state;
    let newAmounts = [...amounts];
    newAmounts[i] = e.target.value || '';
    return this.setState({ amounts: newAmounts });
  }

  onMax = (index) => {
    const { accountData, amounts } = this.state;
    const { amount, mint } = accountData[index] || {}
    const { decimals } = mint || {}
    let newAmounts = [...amounts];
    newAmounts[index] = ssjs.undecimalize(amount, decimals);
    return this.setState({ amounts: newAmounts });
  }

  addLiquidity = () => {
    const {
      wallet: { accounts }, updateWallet, data: { address: poolAddress },
      setError, onClose
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
          return onClose();
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
    const { loading, amounts, accountData } = this.state;

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
          {accountData.map((each, index) => {
            if (!each) return null;
            const { amount, mint } = each;
            const { symbol, name, icon, decimals } = mint || {}
            return <Fragment key={index}>
              <Grid item xs={12} >
                <TextField
                  label={name}
                  variant="contained"
                  placeholder="0"
                  value={amounts[index]}
                  onChange={(e) => this.onAmount(index, e)}
                  InputProps={{
                    startAdornment: <Grid container className={classes.noWrap}>
                      <Grid item>
                        <Grid container className={classes.noWrap} alignItems="center">
                          <Grid item>
                            <MintAvatar icon={icon} />
                          </Grid>
                          <Grid item>
                            <Typography>{symbol}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item>
                        <Divider orientation="vertical" />
                      </Grid>
                    </Grid>,
                    endAdornment: <Button color="primary" onClick={() => this.onMax(index)}>
                      <Typography>MAX</Typography>
                    </Button>
                  }}
                  helperText={`Available: ${utils.prettyNumber(ssjs.undecimalize(amount, decimals))} ${symbol || ''}`}
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
              onClick={this.addLiquidity}
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
  setError,
  updateWallet,
  getAccountData,
}, dispatch);

AddLiquidity.defaultProps = {
  visible: true,
  data: {},
  onClose: () => { },
}

AddLiquidity.propTypes = {
  visible: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));