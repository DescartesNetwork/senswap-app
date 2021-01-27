import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';

import {
  PowerRounded, CheckCircleOutlineRounded, HelpOutlineRounded,
} from '@material-ui/icons';

import AccountSelection from './accountSelection';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { openWallet, updateWallet, getSecretKey } from 'modules/wallet.reducer';


const EMPTY = {
  address: '',
  amount: 0,
  price: 0,
  data: {},
}

class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      poolAddress: '',
      treasuryAddress: '',
      lptAddress: '',
    }
  }

  fetchData = () => {
    const { address } = this.state;
    if (!address) return this.setState({ ...EMPTY });
    return sol.getTokenData(address).then(re => {
      return this.setState({ data: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onAddress = (address) => {
    return this.setState({ address }, () => {
      return this.fetchData();
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
    const { classes } = this.props;
    const { openWallet } = this.props;
    const {
      amount, price,
      data: { initialized, token, amount: tokenAmount }
    } = this.state;
    const balance = initialized ? utils.prettyNumber(utils.div(tokenAmount, global.BigInt(10 ** token.decimals))) : '0';

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Your token info</Typography>
      </Grid>
      <Grid item xs={12}>
        <AccountSelection onChange={this.onAddress} />
      </Grid>
      {initialized ? <Grid item xs={12}>
        <TextField
          label="Balance"
          variant="outlined"
          value={balance}
          fullWidth
        />
      </Grid> : null}
      {initialized ? <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <Typography variant="h6">Pool info</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="You are the first liquidity provider. Once you are happy with the rate click the button to create a new pool.">
              <IconButton size="small">
                <HelpOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid> : null}
      {initialized ? <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          fullWidth
        />
      </Grid> : null}
      {initialized ? <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={price}
          onChange={this.onPrice}
          fullWidth
        />
      </Grid> : null}
      {initialized ? <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircleOutlineRounded />}
          onClick={this.newPool}
          fullWidth
        >
          <Typography variant="body2">Create</Typography>
        </Button>
      </Grid> : <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PowerRounded />}
              onClick={openWallet}
              fullWidth
            >
              <Typography>Connect/Open wallet</Typography>
            </Button>
          </Grid>
        </Grid>}
      {this.renderResult()}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  openWallet, updateWallet, getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NewPool)));