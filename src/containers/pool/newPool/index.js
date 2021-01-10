import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import { CheckCircleOutlineRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';


class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      amount: 0,
      price: 0,
      data: {},
      poolAddress: '',
      treasuryAddress: '',
      lptAddress: '',
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { currentTokenAccount: prevCurrentAccountToken } } = prevProps;
    const { wallet: { currentTokenAccount } } = this.props;
    if (!isEqual(currentTokenAccount, prevCurrentAccountToken)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { currentTokenAccount } } = this.props;
    return sol.getTokenData(currentTokenAccount).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onPrice = (e) => {
    const price = e.target.value || '';
    return this.setState({ price });
  }

  newPool = () => {
    const { data: { address, initialized, token }, amount, price } = this.state;
    const { wallet: { user }, updateWallet, getSecretKey } = this.props;
    if (!initialized || !amount || !price) return console.error('Invalid input');

    return getSecretKey().then(secretKey => {
      const reserve = global.BigInt(amount * 10 ** token.decimals);
      const usd = global.BigInt(price * amount * 10 ** token.decimals);
      const srcTokenPublicKey = sol.fromAddress(address);
      const tokenPublicKey = sol.fromAddress(token.address);
      const payer = sol.fromSecretKey(secretKey);
      return sol.newPool(
        reserve,
        usd,
        srcTokenPublicKey,
        tokenPublicKey,
        payer
      );
    }).then(({ pool, treasury, lpt }) => {
      return new Promise((resolve, reject) => {
        return this.setState({
          poolAddress: pool.publicKey.toBase58(),
          treasuryAddress: treasury.publicKey.toBase58(),
          lptAddress: lpt.publicKey.toBase58(),
        }, () => {
          return resolve({ pool, treasury, lpt });
        });
      });
    }).then(re => {
      const { lptAddress } = this.state;
      const lptAccounts = [...user.lptAccounts];
      lptAccounts.push(lptAddress);
      return updateWallet({ ...user, lptAccounts });
    }).catch(er => {
      return console.error(er);
    });
  }

  renderResult = () => {
    const { poolAddress, treasuryAddress, lptAddress } = this.state;
    if (!poolAddress || !treasuryAddress || !lptAddress) return null;
    return <Grid item xs={12}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">A pool is successfully generated! Click to your wallet to see details.</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField label="Pool" variant="outlined" value={poolAddress} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Treasury" variant="outlined" value={treasuryAddress} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField label="LPT" variant="outlined" value={lptAddress} fullWidth />
        </Grid>
      </Grid>
    </Grid>
  }

  render() {
    const {
      amount, price,
      data: { address, initialized, token, amount: tokenAmount }
    } = this.state;
    if (!initialized) return null;
    const symbol = sol.toSymbol(token.symbol);
    const balance = utils.prettyNumber(utils.div(tokenAmount, global.BigInt(10 ** token.decimals))) || '0';

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography>You are the first liquidity provider. Once you are happy with the rate click supply to review.</Typography>
      </Grid>
      <Grid item xs={8}>
        <TextField
          label={symbol}
          variant="outlined"
          value={address}
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Balance"
          variant="outlined"
          value={balance}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={price}
          onChange={this.onPrice}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircleOutlineRounded />}
          onClick={this.newPool}
          fullWidth
        >
          <Typography variant="body2">Create</Typography>
        </Button>
      </Grid>
      {this.renderResult()}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPool)));