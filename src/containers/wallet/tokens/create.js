import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

import { AddRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { updateToken } from 'modules/wallet.reducer';


class Create extends Component {
  constructor() {
    super();

    this.state = {
      message: '',
      value: {},
      counter: 10000
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(wallet, prevWallet)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { token } } = this.props;
    return utils.getTokenAccountData(token).then(value => {
      return this.setState({ value });
    }).catch(er => {
      return console.error(er);
    });
  }

  newAccount = () => {
    const { wallet: { tokens, secretKey }, updateToken } = this.props;
    const { value } = this.state;
    const payer = utils.fromSecretKey(secretKey);
    const tokenPublicKey = utils.fromAddress(value.token);
    return utils.newSRC20Account(tokenPublicKey, payer).then(re => {
      const newTokens = [...tokens];
      newTokens.push(re.publicKey.toBase58());
      return updateToken(newTokens);
    }).then(re => {
      const address = re.tokens[re.tokens.length - 1];
      return this.setNotification(address);
    }).catch(er => {
      return console.log(er);
    });
  }

  setNotification = (address) => {
    return this.setState({ message: `A new account ${address} is created. You can review it in 'Add/Remove your token accounts'` }, () => {
      const id = setInterval(() => {
        const { counter } = this.state;
        if (counter > 0) return this.setState({ counter: counter - 100 });
        clearInterval(id);
        return this.setState({ message: '', counter: 10000 });
      }, 100)
    })
  }

  render() {
    const { classes } = this.props;
    const { value, counter, message } = this.state;
    if (!value.token) return null;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Create a new token account</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <TextField
              label={`${value.symbol.join('').replace('-', '')} Contract`}
              variant="outlined"
              color="primary"
              value={value.token}
              size="small"
              InputProps={{
                endAdornment: <CircularProgress
                  variant="determinate"
                  size={16}
                  value={Math.round((10000 - counter) / 10000 * 100)}
                />
              }}
              helperText={message}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.newAccount}
              startIcon={<AddRounded />}
            >
              <Typography>New</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  updateToken
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Create)));