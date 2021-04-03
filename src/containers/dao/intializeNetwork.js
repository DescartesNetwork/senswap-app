import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { AddRounded, FlightTakeoffRounded } from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import Token from './token';

import styles from './styles';
import configs from 'configs';
import { getMintData } from 'modules/bucket.reducer';
import { addNetwork } from 'modules/network.reducer';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';


class InitializeNetwork extends Component {
  constructor() {
    super();

    this.state = {
      done: false,
      loading: false,
      mint: '',
      data: {},
      mints: [],
    }

    this.swap = window.senwallet.swap;
  }

  componentDidMount() {
    return this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(prevUser, user)) this.fetchData();
  }

  fetchData = () => {
    const { sol: { senAddress } } = configs;
    const { getMintData } = this.props;
    return this.setState({ loading: true }, () => {
      return getMintData(senAddress).then(data => {
        const mints = [data];
        return this.setState({ loading: false, mints });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onMint = (e) => {
    const mint = e.target.value || '';
    return this.setState({ mint }, this.onData);
  }

  onData = () => {
    const { getMintData, setError } = this.props;
    const { mint } = this.state;
    if (!ssjs.isAddress(mint)) return this.setState({ data: {} });
    return this.setState({ loading: true }, () => {
      return getMintData(mint).then(data => {
        return this.setState({ loading: false, data });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onAddMint = () => {
    const { data, mints } = this.state;
    if (!data || !data.address) return;
    let existing = false;
    mints.forEach(({ address }) => {
      if (address === data.address) return existing = true;
    });
    if (existing) return this.setState({ mint: '', data: {} });
    const newMints = [...mints];
    newMints.push(data);
    return this.setState({ mint: '', data: {}, mints: newMints });
  }

  onDeleteMint = (index) => {
    const { mints } = this.state;
    const newMints = [...mints];
    newMints.splice(index, 1);
    return this.setState({ mints: newMints });
  }

  newNetwork = () => {
    const { addNetwork, unlockWallet, setError } = this.props;
    const { mints } = this.state;
    const mintAddresses = mints.map(mint => mint.address);

    const network = ssjs.createAccount();
    const primaryAddress = mintAddresses.shift();
    let vault = null;
    let secretKey = null;

    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        console.log(secretKey);
        return ssjs.createStrictAccount(this.swap.swapProgramId);
      }).then(re => {
        vault = re;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.initializeNetwork(
          network,
          primaryAddress,
          vault,
          mintAddresses,
          payer
        );
      }).then(txId => {
        const data = { address: network.publicKey.toBase58() }
        return addNetwork(data, secretKey);
      }).then(re => {
        return this.setState({ loading: false, done: true });
      }).catch(er => {
        return setError(er);
      });
    });
  }

  render() {
    const { classes } = this.props;
    const {
      mint, data: { name, icon, symbol }, mints,
      done, loading
    } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label={name || 'Token'}
          variant="outlined"
          color="secondary"
          value={mint}
          onChange={this.onMint}
          InputProps={{
            startAdornment: <MintAvatar
              icon={icon}
              title={symbol}
              marginRight
            />,
            endAdornment: <IconButton
              edge="end"
              color="secondary"
              onClick={this.onAddMint}
              disabled={loading}
            >
              {loading ? <CircularProgress size={17} /> : <AddRounded />}
            </IconButton>
          }}
          onKeyPress={e => {
            if (e.key === 'Enter') return this.onAddMint();
          }}
          helperText="You can add maximum 21 token including SEN to a network"
          fullWidth
        />
      </Grid>
      {mints.map(({ address }, index) => <Grid item key={index}>
        <Token
          address={address}
          onDelete={() => this.onDeleteMint(index)}
          readOnly={index === 0}
        />
      </Grid>)}
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            {done ? <Typography variant="body2">Done! You need to reload the application to see the changes</Typography> : null}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
              onClick={this.newNetwork}
              disabled={loading}
            >
              <Typography>Initialize</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  network: state.network,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getMintData,
  addNetwork,
  setError,
  unlockWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(InitializeNetwork)));