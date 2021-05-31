import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Link from 'senswap-ui/link';

import { SwapHorizRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getMint } from 'modules/mint.reducer';
import { getAccountData } from 'modules/bucket.reducer';
import { updateWallet } from 'modules/wallet.reducer';


class WSOL extends Component {
  constructor() {
    super();

    this.state = {
      amount: '',
      unwrap: false,
      data: {},
    }

    this.splt = window.senswap.splt;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUsers } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(prevUsers, user)) this.fetchData();
  }

  fetchData = async () => {
    const {
      setError, getMint, getAccountData,
      wallet: { user: { address: walletAddress } }
    } = this.props;
    try {
      const mintData = await getMint(ssjs.DEFAULT_WSOL);
      const { address: mintAddress } = mintData;
      if (!ssjs.isAddress(mintAddress)) return this.setState({ data: {} });
      if (!ssjs.isAddress(walletAddress)) return this.setState({ data: {} });
      const { address: accountAddress, state } = await sol.scanAccount(mintAddress, walletAddress);
      if (!state) return this.setState({ data: { address: accountAddress, mint: mintData } });
      const data = await getAccountData(accountAddress);
      return this.setState({ data });
    } catch (er) {
      return setError(er);
    }
  }

  onSwitch = () => {
    const { unwrap } = this.state;
    return this.setState({ unwrap: !unwrap });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  add = async () => {
    let { wallet: { lamports, accounts }, setError, setSuccess, updateWallet } = this.props;
    const { amount, data } = this.state;
    const { address: accountAddress, state, amount: wlamports } = data;
    if (!amount || !lamports) return setError('Invalid amount');
    if (!ssjs.isAddress(accountAddress)) return setError('Invalid account address');
    let value = ssjs.decimalize(amount, 9);
    if (value > global.BigInt(lamports)) return setError('Not enough SOL');
    try {
      if (state) await this.splt.unwrap(accountAddress, window.senswap.wallet);
      value = value + (wlamports || global.BigInt(0));
      const { txId } = await this.splt.wrap(value, window.senswap.wallet);
      const newAccounts = [...accounts];
      if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
      updateWallet({ accounts: newAccounts });
      await setSuccess('Wrap successfully', utils.explorer(txId));
      return this.setState({ amount: '' }, this.fetchData);
    } catch (er) {
      return setError(er);
    }
  }

  remove = async () => {
    const { wallet: { accounts }, setError, setSuccess, updateWallet } = this.props;
    const { amount, data } = this.state;
    const { address: accountAddress, amount: wlamports } = data;
    if (!amount || !wlamports) return setError('Invalid amount');
    if (!ssjs.isAddress(accountAddress)) return setError('Invalid account address');
    let value = ssjs.decimalize(amount, 9);
    if (value > wlamports) return setError('Not enough SOL');
    try {
      let txId = await this.splt.unwrap(accountAddress, window.senswap.wallet);
      if (wlamports - value) {
        const re = await this.splt.wrap(wlamports - value, window.senswap.wallet);
        txId = re.txId;
      } else {
        const newAccounts = accounts.filter(({ address }) => address !== accountAddress);
        updateWallet({ accounts: newAccounts });
      }
      await setSuccess('Wrap successfully', utils.explorer(txId));
      return this.setState({ amount: '' }, this.fetchData);
    } catch (er) {
      return setError(er);
    }
  }

  renderTextField = (data, input = false) => {
    const { amount } = this.state;
    const { amount: balance, mint } = data;
    const { symbol, icon, decimals } = mint || {};

    const maximum = ssjs.undecimalize(balance, decimals).toString();

    return <TextField
      variant="contained"
      placeholder="0"
      value={amount}
      onChange={input ? this.onAmount : () => { }}
      InputProps={{
        startAdornment: <MintAvatar icon={icon} />,
        endAdornment: <Button>
          <Typography>{symbol}</Typography>
        </Button>
      }}
      helperTextPrimary={<Typography variant="caption" color="textSecondary">
        {`${numeral(ssjs.undecimalize(balance, decimals)).format('0,0.[000000]')} ${symbol}`}
      </Typography>}
      helperTextSecondary={input ? <Grid container justify="flex-end">
        <Grid item>
          <Link
            color="primary"
            variant="caption"
            onClick={() => this.onAmount({ target: { value: maximum } })}
          >MAXIMUM</Link>
        </Grid>
      </Grid> : null}
      readOnly={!input}
      fullWidth
    />
  }

  render() {
    const { wallet: { user: { address: walletAddress }, lamports } } = this.props;
    const { data: wsolAccountData, unwrap, amount } = this.state;
    const solAccountData = {
      address: walletAddress,
      amount: global.BigInt(lamports || 0),
      mint: configs.sol.native,
    }

    return <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} md={5}>
        {this.renderTextField(unwrap ? wsolAccountData : solAccountData, true)}
      </Grid>
      <Grid item xs={12} md={2}>
        <Grid container justify="center">
          <Grid item>
            <Button
              size="small"
              startIcon={<SwapHorizRounded />}
              onClick={this.onSwitch}
            >
              <Typography variant="caption">Switch</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={5}>
        {this.renderTextField(unwrap ? solAccountData : wsolAccountData)}
      </Grid>
      <Grid item xs={12} >
        <Button
          color="primary"
          variant="contained"
          onClick={unwrap ? this.remove : this.add}
          disabled={!amount}
          fullWidth
        >
          <Typography>{unwrap ? 'Unwrap' : 'Wrap'}</Typography>
        </Button>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
  mint: state.mint,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  getMint,
  getAccountData,
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WSOL)));