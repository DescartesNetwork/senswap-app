import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Paper from 'senswap-ui/paper';
import CircularProgress from 'senswap-ui/circularProgress';

import { CloseRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';


const DEFAULT_STATE = {
  amount: '',
  amountError: '',
  address: '',
  addressError: '',
  loading: false,
}

class Send extends Component {
  constructor() {
    super();

    this.state = {
      ...DEFAULT_STATE
    }
  }

  componentDidUpdate(prevProps) {
    const { visible: prevVisible } = prevProps;
    const { visible } = this.props;
    if (!isEqual(prevVisible, visible) && !visible) return this.setState({
      ...DEFAULT_STATE
    });
  }

  onAmount = (e) => {
    const strAmount = e.target.value || '';
    const { data: { amount: balance, mint: { decimals } } } = this.props;
    const amount = ssjs.decimalize(strAmount, decimals);
    const amountError = !amount || amount > balance ? 'Invalid amount' : '';
    return this.setState({ amount: strAmount, amountError });
  }

  onAddress = (e) => {
    const address = e.target.value || '';
    const addressError = !ssjs.isAddress(address) ? 'Invalid receiver address' : '';
    return this.setState({ address, addressError });
  }

  onMax = () => {
    const { data: { amount: balance, mint: { decimals } } } = this.props;
    return this.setState({ amount: ssjs.undecimalize(balance, decimals) });
  }

  onSend = () => {
    const { onSend, data: { address: from, amount: balance, mint: { symbol, decimals } } } = this.props;
    const { amount: strAmount, amountError, address: to, addressError } = this.state;
    const amount = ssjs.decimalize(strAmount, decimals);
    if (!ssjs.isAddress(to) || addressError) return this.setState({ addressError: 'Invalid receiver address' });
    if (!amount || amount > balance || amountError) return this.setState({ amountError: 'Invalid amount' });
    return this.setState({ loading: true }, () => {
      return onSend({ amount, from: symbol === 'SOL' ? '' : from, to });
    });
  }

  render() {
    const { classes } = this.props;
    const { visible, data: { amount: balance, mint }, onClose } = this.props;
    const { amount, amountError, address, addressError, loading } = this.state;
    const { icon, name, symbol, decimals } = mint || {}

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item>
            <MintAvatar icon={icon} />
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1" style={{ marginBottom: -6 }}>Send {symbol}</Typography>
            <Typography variant="body2" color="textSecondary">{name}</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              label="Receiver Address"
              placeholder="Input the address"
              error={addressError}
              value={address}
              onChange={this.onAddress}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              label="Amount"
              placeholder="Minimum 0"
              value={amount}
              onChange={this.onAmount}
              error={amountError}
              helperTextSecondary={`Available: ${ssjs.undecimalize(balance, decimals)} ${symbol}`}
              InputProps={{
                endAdornment: <Grid container alignItems="center">
                  <Grid item>
                    <Typography color="textSecondary">{symbol}</Typography>
                  </Grid>
                  <Grid item>
                    <Button color="primary" onClick={this.onMax} size="small">
                      <Typography>Max</Typography>
                    </Button>
                  </Grid>
                </Grid>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paperInSend}>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">TRANSACTION FEE</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>{symbol === 'SOL' ? '0.000000001' : '0.000005'} SOL</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paperInSend}>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">REMAINER</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>{ssjs.undecimalize(balance, decimals) - amount} {symbol}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} />
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onSend}
              size="large"
              endIcon={loading ? <CircularProgress size={17} /> : null}
              disabled={loading}
              fullWidth
            >
              <Typography>Send</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Send.defaultProps = {
  visible: false,
  data: {},
  onSend: () => { },
  onClose: () => { },
}

Send.propTypes = {
  visible: PropTypes.bool,
  data: PropTypes.object,
  onSend: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Send)));