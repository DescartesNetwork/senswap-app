import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Collapse from '@material-ui/core/Collapse';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  HelpOutlineRounded, FlightTakeoffRounded, SettingsRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import MintAddress from './address';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet } from 'modules/wallet.reducer';

const EMPTY = {
  loading: false,
  txId: '',
  anchorEl: null,
}

class InitializeMint extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      supply: 5000000000,
      decimals: 9,
      advance: false,
    }

    this.splt = window.senwallet.splt;
  }

  onOpen = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onClose = () => {
    return this.setState({ anchorEl: null });
  }

  onAdvance = (e) => {
    const advance = e.target.checked || false;
    return this.setState({ advance });
  }

  onMint = (secretKey) => {
    const mint = ssjs.fromSecretKey(secretKey);
    return this.setState({ mint });
  }

  onSupply = (e) => {
    const supply = e.target.value || '';
    return this.setState({ supply, ...EMPTY });
  }

  onDecimals = (e) => {
    const decimals = e.target.value || '';
    return this.setState({ decimals, ...EMPTY });
  }

  onCreate = () => {
    const { mint, supply: refSupply, decimals: refDecimals } = this.state;
    const {
      wallet: { user, accounts },
      setError,
      unlockWallet, updateWallet
    } = this.props;

    const decimals = parseInt(refDecimals) || 0;
    const supply = parseInt(refSupply) || 0;
    if (!mint) return setError('Waiting for the token address generation');
    if (decimals < 1 || decimals > 9) return setError('Decimals must be an integer that greater than 0, and less then 10');
    if (supply < 1 || supply > 1000000000000) return setError('Total supply must be grearer than0, and less than or equal to 1000000000000');

    const mintAddress = mint.publicKey.toBase58();
    let secretKey = null;
    let txId = null;
    let accountAddress = null;
    const totalSupply = global.BigInt(supply) * global.BigInt(10 ** decimals);
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.splt.initializeMint(decimals, null, mint, payer);
      }).then(txId => {
        return sol.newAccount(mintAddress, secretKey);
      }).then(({ address, txId }) => {
        accountAddress = address;
        const payer = ssjs.fromSecretKey(secretKey);
        return this.splt.mintTo(totalSupply, mintAddress, accountAddress, payer);
      }).then(refTxId => {
        txId = refTxId;
        const newMints = [...user.mints];
        if (!newMints.includes(mintAddress)) newMints.push(mintAddress);
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ user: { ...user, mints: newMints }, accounts: newAccounts });
      }).then(re => {
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
    const {
      anchorEl, advance, loading, txId,
      supply, decimals
    } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6">Token Info</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={this.onOpen}>
              <SettingsRounded color="secondary" fontSize="small" />
            </IconButton>
            <Popover
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={this.onClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <BaseCard>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">Interface Settings</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
                      <Grid item>
                        <Typography>Expert mode</Typography>
                      </Grid>
                      <Grid item className={classes.stretch}>
                        <Tooltip title="The LPT account will be selected, or generated automatically by default. By enabling expert mode, you can controll it by hands.">
                          <IconButton size="small">
                            <HelpOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid item>
                        <Switch
                          color="primary"
                          checked={advance}
                          onChange={this.onAdvance}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </BaseCard>
            </Popover>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <MintAddress onChange={this.onMint} />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="Decimals"
          variant="outlined"
          value={decimals}
          onChange={this.onDecimals}
          fullWidth
        />
      </Grid>
      <Grid item xs={8}>
        <TextField
          label="Supply"
          variant="outlined"
          helperText="Do not include decimals."
          value={supply}
          onChange={this.onSupply}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Collapse in={advance}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="SPL Token Address"
                variant="outlined"
                value={this.splt.spltProgramId.toBase58()}
                inputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            {txId ? <Typography>Success - <Link href={utils.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography> : null}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onCreate}
              endIcon={loading ? <CircularProgress size={17} /> : <FlightTakeoffRounded />}
              disabled={loading}
            >
              <Typography>New</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(InitializeMint)));