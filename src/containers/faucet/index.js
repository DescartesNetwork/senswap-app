import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Facebook, Twitter, FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import sol from 'helpers/sol';
import { getSecretKey, updateWallet } from 'modules/wallet.reducer';
import { getWhiteList, airdropLamports, airdropTokens } from 'modules/faucet.reducer';


const EMPTY = {
  loading: false,
  error: '',
  txId: ''
}
const SHARE_TEXT = 'luv%20this%20tool%20%E2%9D%A4%EF%B8%8F%20guys';
const SHARE_URL = 'https%3A%2F%2Fsenswap.io';

class Faucet extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
      loading: false,
      link: '',
      tokenAddress: '',
      ...EMPTY
    }
  }

  componentDidMount() {
    const { getWhiteList } = this.props;
    return getWhiteList().then(({ tokens }) => {
      const pseudoEvent = { target: { value: tokens[0] } };
      return this.onSelect(pseudoEvent);
    }).catch(er => {
      return console.error(er);
    });
  }

  onLink = (e) => {
    const link = e.target.value || '';
    return this.setState({ link, ...EMPTY });
  }

  onSelect = (e) => {
    const tokenAddress = e.target.value || '';
    return this.setState({ tokenAddress }, () => {
      if (tokenAddress) return sol.getPureTokenData(tokenAddress).then(data => {
        return this.setState({ ...EMPTY, data });
      }).catch(er => {
        return this.setState({ ...EMPTY, error: er });
      });
    });
  }

  onAirdrop = () => {
    const {
      wallet: { user },
      getSecretKey, updateWallet, airdropLamports, airdropTokens,
    } = this.props;
    const { tokenAddress, link } = this.state;
    if (!tokenAddress) return this.setState({ ...EMPTY, error: 'Invalid token' });
    if (!link) return this.setState({ ...EMPTY, error: 'Please parse the share link' });

    return this.setState({ ...EMPTY, loading: true }, () => {
      return airdropLamports(user.address).then(re => {
        return getSecretKey();
      }).then(secretKey => {
        const payer = sol.fromSecretKey(secretKey);
        const token = sol.fromAddress(tokenAddress);
        return sol.newSRC20Account(token, payer);
      }).then(tokenAccount => {
        const dstAddress = tokenAccount.publicKey.toBase58();
        return airdropTokens(dstAddress, tokenAddress);
      }).then(({ dstAddress, txId }) => {
        this.setState({ ...EMPTY, txId });
        const tokenAccounts = [...user.tokenAccounts];
        tokenAccounts.push(dstAddress);
        return updateWallet({ ...user, tokenAccounts });
      }).catch(er => {
        return this.setState({ ...EMPTY, error: er });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { tokenAddress, data, link, error, txId, loading } = this.state;
    const { faucet: { tokens } } = this.props;
    const symbol = sol.toSymbol(data.symbol);

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <Grid container justify="center" spacing={2}>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h4">SenFaucet</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <Typography>You will receive a little amount of desired token to test. Be aware that these tokens are valueless.</Typography>
                  <Typography>Please spread this great function to other people and then paste the link to execute an airdrop. 🚀</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <TextField
                        label="Social link"
                        variant="outlined"
                        value={link}
                        onChange={this.onLink}
                        fullWidth
                      />
                    </Grid>
                    <Grid item>
                      <IconButton color="secondary" target="_blank" href={`https://www.facebook.com/sharer/sharer.php?u=${SHARE_URL}`}>
                        <Facebook />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton color="secondary" target="_blank" href={`https://twitter.com/intent/tweet?text=${SHARE_TEXT}&url=${SHARE_URL}`}>
                        <Twitter />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>{symbol}</InputLabel>
                    <Select
                      label={symbol}
                      value={tokenAddress}
                      onChange={this.onSelect}
                    >
                      {tokens.map(tokenAddress => <MenuItem key={tokenAddress} value={tokenAddress}>{tokenAddress}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap} spacing={2}>
                    <Grid item className={classes.stretch}>
                      {error ? <Typography color="error">{error}</Typography> : null}
                      {txId ? <Typography>A new account was added into your wallet!</Typography> : null}
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
                        onClick={this.onAirdrop}
                        disabled={loading}
                      >
                        <Typography>OK</Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  faucet: state.faucet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getSecretKey, updateWallet,
  getWhiteList, airdropLamports, airdropTokens,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Faucet)));