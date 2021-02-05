import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

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
import Link from '@material-ui/core/Link';

import { Facebook, Twitter, FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet, openWallet } from 'modules/wallet.reducer';
import { getWhiteList, airdropLamports, airdropTokens } from 'modules/faucet.reducer';


const EMPTY = {
  loading: false,
  txId: ''
}
const SHARE_TEXT = 'luv%20this%20tool%20%E2%9D%A4%EF%B8%8F%20guys';
const SHARE_URL = 'https%3A%2F%2Fsenswap.io';

class Faucet extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: {},
      link: '',
      tokenAddress: '',
    }
  }

  componentDidMount() {
    const { setError, getWhiteList } = this.props;
    return getWhiteList().then(({ tokens }) => {
      const pseudoEvent = { target: { value: tokens[0] } };
      return this.onSelect(pseudoEvent);
    }).catch(er => {
      return setError(er);
    });
  }

  onLink = (e) => {
    const link = e.target.value || '';
    return this.setState({ link, ...EMPTY });
  }

  onSelect = (e) => {
    const tokenAddress = e.target.value || '';
    const { setError } = this.props;
    return this.setState({ tokenAddress }, () => {
      if (tokenAddress) return sol.getPureTokenData(tokenAddress).then(data => {
        return this.setState({ ...EMPTY, data });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onAirdrop = () => {
    const {
      wallet: { user },
      setError,
      unlockWallet, updateWallet,
      airdropLamports, airdropTokens,
    } = this.props;
    const { tokenAddress, link } = this.state;
    if (!ssjs.isAddress(tokenAddress)) return setError('Invalid token');
    if (!link) return setError('Please parse the share link into the box');

    return this.setState({ loading: true }, () => {
      return airdropLamports(user.address).then(re => {
        return unlockWallet();
      }).then(secretKey => {
        const payer = ssjs.fromSecretKey(secretKey);
        const token = ssjs.fromAddress(tokenAddress);
        return sol.newSRC20Account(token, payer);
      }).then(tokenAccount => {
        const dstAddress = tokenAccount.publicKey.toBase58();
        return airdropTokens(dstAddress, tokenAddress);
      }).then(({ dstAddress, txId }) => {
        return this.setState({ ...EMPTY, txId }, () => {
          const tokenAccounts = [...user.tokenAccounts];
          tokenAccounts.push(dstAddress);
          return updateWallet({ ...user, tokenAccounts });
        });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { tokenAddress, data, link, txId, loading } = this.state;
    const { faucet: { tokens }, openWallet } = this.props;

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
                      <IconButton color="secondary" href={`https://www.facebook.com/sharer/sharer.php?u=${SHARE_URL}`} target="_blank" rel="noopener">
                        <Facebook />
                      </IconButton>
                    </Grid>
                    <Grid item>
                      <IconButton color="secondary" href={`https://twitter.com/intent/tweet?text=${SHARE_TEXT}&url=${SHARE_URL}`} target="_blank" rel="noopener">
                        <Twitter />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>{ssjs.toSymbol(data.symbol)}</InputLabel>
                    <Select
                      label={ssjs.toSymbol(data.symbol)}
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
                      {txId ? <Typography>Success - <Link component="button" variant="body1" onClick={openWallet}>check it out!</Link></Typography> : null}
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
  setError,
  unlockWallet, updateWallet, openWallet,
  getWhiteList, airdropLamports, airdropTokens,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Faucet)));