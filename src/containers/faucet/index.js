import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';

import { FlightTakeoffRounded } from '@material-ui/icons';

import Drain from 'components/drain';
import { BaseCard } from 'components/cards';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet, openWallet, syncWallet } from 'modules/wallet.reducer';
import { getWhiteList, airdropLamports, airdropTokens } from 'modules/faucet.reducer';
import { getMintData, getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: ''
}

class Faucet extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: {},
      mintAddress: '',
    }
  }

  componentDidMount() {
    const { setError, getWhiteList } = this.props;
    return getWhiteList().then(({ mints }) => {
      const pseudoEvent = { target: { value: mints[0] } };
      return this.onSelect(pseudoEvent);
    }).catch(er => {
      return setError(er);
    });
  }

  onSelect = (e) => {
    const mintAddress = e.target.value || '';
    const { setError, getMintData } = this.props;
    return this.setState({ mintAddress }, () => {
      if (mintAddress) return getMintData(mintAddress).then(data => {
        return this.setState({ ...EMPTY, data });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onAutogenDestinationAddress = (mintAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!secretKey) return reject('Cannot unlock account');
      if (!ssjs.isAddress(mintAddress)) return reject('Invalid token address');

      const {
        wallet: { user, accounts },
        getAccountData,
        updateWallet, syncWallet
      } = this.props;
      return Promise.all(accounts.map(accountAddress => {
        return getAccountData(accountAddress);
      })).then(data => {
        const accountData = data.find(({ mint: { address } }) => address === mintAddress);
        if (accountData && accountData.address) return resolve(accountData.address);
        let accountAddress = null;
        console.log("Start")
        return sol.newAccount(mintAddress, secretKey).then(({ address }) => {
          accountAddress = address;
          const newMints = [...user.mints];
          if (!newMints.includes(mintAddress)) newMints.push(mintAddress);
          const newAccounts = [...accounts];
          if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
          return updateWallet({ user: { ...user, mints: newMints }, accounts: newAccounts });
        }).then(re => {
          return syncWallet();
        }).then(re => {
          return resolve(accountAddress);
        }).catch(er => {
          return reject(er);
        });
      }).catch(er => {
        return reject(er);
      });
    });
  }

  onAirdrop = () => {
    const {
      wallet: { user },
      setError,
      unlockWallet,
      airdropLamports, airdropTokens,
    } = this.props;
    const { mintAddress } = this.state;
    if (!ssjs.isAddress(mintAddress)) return setError('Invalid token address');

    return this.setState({ loading: true }, () => {
      return airdropLamports(user.address).then(re => {
        return unlockWallet();
      }).then(secretKey => {
        return this.onAutogenDestinationAddress(mintAddress, secretKey);
      }).then(dstAddress => {
        return airdropTokens(dstAddress, mintAddress);
      }).then(({ txId }) => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { mintAddress, data, txId, loading } = this.state;
    const { faucet: { mints }, openWallet } = this.props;

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
                </Grid>
                <Grid item xs={12}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>{ssjs.toSymbol(data.symbol)}</InputLabel>
                    <Select
                      label={ssjs.toSymbol(data.symbol)}
                      value={mintAddress}
                      onChange={this.onSelect}
                    >
                      {mints.map(mintAddress => <MenuItem key={mintAddress} value={mintAddress}>{mintAddress}</MenuItem>)}
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
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet, updateWallet, openWallet, syncWallet,
  getWhiteList, airdropLamports, airdropTokens,
  getMintData, getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Faucet)));