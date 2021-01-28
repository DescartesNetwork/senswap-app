import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  CheckCircleOutlineRounded, HelpOutlineRounded, VerifiedUserRounded,
  PublicRounded, ArrowForwardRounded,
} from '@material-ui/icons';

import AccountSelection from './accountSelection';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { updateWallet, getSecretKey } from 'modules/wallet.reducer';


const EMPTY = {
  txId: '',
  poolAddress: '',
  loading: false,
  amount: 0,
  price: 0,
}

class NewPool extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      address: '',
      data: {},
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

  onClear = () => {
    return this.setState({ ...EMPTY });
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

    let poolAddress = '';
    let txId = '';
    return this.setState({ loading: true }, () => {
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
      }).then(({ pool, lpt, txId: refTxId }) => {
        txId = refTxId;
        poolAddress = pool.publicKey.toBase58();
        const lptAddress = lpt.publicKey.toBase58();
        const lptAccounts = [...user.lptAccounts];
        lptAccounts.push(lptAddress);
        return updateWallet({ ...user, lptAccounts });
      }).then(re => {
        return this.setState({ ...EMPTY, txId, poolAddress });
      }).catch(er => {
        console.error(er);
        return this.setState({ ...EMPTY });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const {
      amount, price,
      loading, txId, poolAddress,
      data: { initialized }
    } = this.state;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Your token info</Typography>
      </Grid>
      <Grid item xs={12}>
        <AccountSelection onChange={this.onAddress} />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
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
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial amount"
          variant="outlined"
          value={amount}
          onChange={this.onAmount}
          disabled={!initialized}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Initial price"
          variant="outlined"
          value={price}
          onChange={this.onPrice}
          disabled={!initialized}
          fullWidth
        />
      </Grid>
      {txId ? <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">Done! However, your pool is still unknown by people. You can click the audit button for SenSwap verification that will advertise your pools on SenSwap platform.</Typography>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to={`/audit/${poolAddress}`}
              startIcon={<VerifiedUserRounded />}
              fullWidth
            >
              <Typography>Audit</Typography>
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              color="secondary"
              href={configs.sol.explorer(txId)}
              target="_blank"
              startIcon={<PublicRounded />}
              fullWidth
            >
              <Typography>Explore</Typography>
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              color="secondary"
              onClick={this.onClear}
              endIcon={<ArrowForwardRounded />}
              fullWidth
            >
              <Typography>Skip</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid> : <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={17} /> : <CheckCircleOutlineRounded />}
            onClick={this.newPool}
            disabled={loading || !initialized}
            fullWidth
          >
            <Typography variant="body2">Create</Typography>
          </Button>
        </Grid>}
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