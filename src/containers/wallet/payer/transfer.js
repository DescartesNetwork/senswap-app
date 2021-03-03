import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Collapse from '@material-ui/core/Collapse';
import Tooltip from '@material-ui/core/Tooltip';

import { SendRounded, CloseRounded, EcoRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';


const EMPTY = {
  loading: false,
  txId: '',
  error: '',
}

class PayerTransfer extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      address: '',
      amount: '',
    }

    this.lamports = window.senwallet.lamports;
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    return this.setState({ address });
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount });
  }

  onClear = () => {
    return this.setState({ ...EMPTY, address: '', amount: '' });
  }

  onMax = () => {
    const { wallet: { user: { address } }, setError } = this.props;
    return this.lamports.get(address).then(re => {
      return this.setState({ amount: re / LAMPORTS_PER_SOL - ssjs.BASIC_TX_FEE });
    }).catch(er => {
      return setError(er);
    });
  }

  onTransfer = () => {
    const { address, amount } = this.state;
    const { setError, unlockWallet } = this.props;
    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (!ssjs.isAddress(address)) return setError('Invalid receiver address');
    if (!lamports || lamports < 0) return setError('Invalid amount');

    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        const payer = ssjs.fromSecretKey(secretKey);
        return this.lamports.transfer(lamports, address, payer);
      }).then(txId => {
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
    const { address, amount, loading, txId } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="body2">Send coin</Typography>
      </Grid>
      <Grid item xs={4}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
                fullWidth
              />
            </Grid>
            <Grid item>
              <Tooltip title="Maximum amount">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={this.onMax}>
                  <EcoRounded />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={8}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={address}
                fullWidth
              />
            </Grid>
            <Grid item>
              <IconButton
                color="secondary"
                size="small"
                onClick={this.onTransfer}>
                {loading ? <CircularProgress size={17} /> : <SendRounded />}
              </IconButton>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
      <Grid item xs={12}>
        <Collapse in={Boolean(txId)}>
          <Alert
            severity="success"
            action={<IconButton onClick={this.onClear} size="small"><CloseRounded /></IconButton>}
          >
            <Typography>Success - <Link color="inherit" href={utils.explorer(txId)} target="_blank" rel="noopener">check it out!</Link></Typography>
          </Alert>
        </Collapse>
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
  unlockWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerTransfer)));