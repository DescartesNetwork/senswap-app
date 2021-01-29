import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Collapse from '@material-ui/core/Collapse';


import { SendRounded, CloseRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { getSecretKey } from 'modules/wallet.reducer';


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

  onTransfer = () => {
    const { address, amount } = this.state;
    const { getSecretKey } = this.props;
    const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    if (!sol.isAddress(address)) return this.setState({ ...EMPTY, error: 'Invalid receiver address' });
    if (!lamports || lamports < 0) return this.setState({ ...EMPTY, error: 'Invalid amount' });
    return this.setState({ loading: true }, () => {
      return getSecretKey().then(secretKey => {
        const dstPublicKey = sol.fromAddress(address);
        const payer = sol.fromSecretKey(secretKey);
        return sol.transferLamports(lamports, dstPublicKey, payer);
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY, error: er.toString() });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { address, amount, error, loading, txId } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard variant="fluent" className={classes.paper}>
          <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <InputBase
                placeholder='Receiver'
                onChange={this.onAddress}
                value={address}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <InputBase
                placeholder='Amount'
                onChange={this.onAmount}
                value={amount}
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
            <Typography>Success - <Link color="inherit" href={configs.sol.explorer(txId)} target="_blank">check it out!</Link></Typography>
          </Alert>
        </Collapse>
        <Collapse in={Boolean(error)}>
          <Alert
            severity="error"
            action={<IconButton onClick={this.onClear} size="small"><CloseRounded /></IconButton>}
          >
            <Typography>Error - {error}</Typography>
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
  getSecretKey,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PayerTransfer)));