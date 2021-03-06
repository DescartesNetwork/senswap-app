import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Link from 'senswap-ui/link';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';

import { FlightTakeoffRounded } from 'senswap-ui/icons';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getWhiteList, airdropTokens } from 'modules/faucet.reducer';
import { getMintData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: ''
}

class Faucet extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: [],
      mintAddress: '',
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = async () => {
    const { setError, getWhiteList, getMintData } = this.props;
    try {
      const whitelist = await getWhiteList();
      const data = await Promise.all(whitelist.map(mintAddress => getMintData(mintAddress)));
      const pseudoEvent = { target: { value: data[0].address } };
      this.onSelect(pseudoEvent);
      return this.setState({ data });
    } catch (er) {
      return setError(er);
    }
  }

  onSelect = (e) => {
    const mintAddress = e.target.value || '';
    return this.setState({ mintAddress });
  }

  onAutogenDestinationAddress = async (mintAddress) => {
    if (!mintAddress) throw new Error('Unknown token');
    const { wallet: { accounts }, updateWallet } = this.props;
    const { address } = await sol.newAccount(mintAddress);
    const newAccounts = [...accounts];
    if (!newAccounts.includes(address)) newAccounts.push(address);
    updateWallet({ accounts: newAccounts });
    return address;
  }

  onAirdrop = async () => {
    const { wallet: { user }, setError, airdropTokens } = this.props;
    const { mintAddress } = this.state;
    if (!ssjs.isAddress(mintAddress)) return setError('Invalid token address');

    this.setState({ loading: true });
    const connection = window.senswap.splt._splt.connection;
    const publicKey = ssjs.fromAddress(user.address);
    const amount = 10 ** 9;
    try {
      await connection.requestAirdrop(publicKey, amount);
      const dstAddress = await this.onAutogenDestinationAddress(mintAddress);
      const { txId } = await airdropTokens(dstAddress, mintAddress);
      return this.setState({ ...EMPTY, txId });
    } catch (er) {
      await setError(er);
      return this.setState({ ...EMPTY });
    }
  }

  render() {
    const { classes } = this.props;
    const { mintAddress, data, txId, loading } = this.state;

    const selectedData = data.filter(({ address }) => address === mintAddress)[0] || {};

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={12}>
        <Drain size={10} />
      </Grid>
      <Grid item xs={12} md={8} lg={6}>
        <Paper className={classes.paper}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">SenFaucet</Typography>
            </Grid>
            <Grid item xs={12}>
              <Drain size={4} />
            </Grid>
            <Grid item xs={12}>
              <Typography>You will receive a little amount of desired token to test. Be aware that these tokens are valueless.</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>{selectedData.name || 'Unknown'}</InputLabel>
                <Select
                  label={selectedData.name || 'Unknown'}
                  value={mintAddress}
                  onChange={this.onSelect}
                >
                  {data.map(({ address }) => <MenuItem key={address} value={address}>{address}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Grid container className={classes.noWrap} spacing={2}>
                <Grid item className={classes.stretch}>
                  {txId ? <Typography>Success - <Link color="primary" to="/wallet">check it out!</Link></Typography> : null}
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
        </Paper>
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
  updateWallet,
  getWhiteList, airdropTokens,
  getMintData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Faucet)));