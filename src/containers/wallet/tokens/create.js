import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

import { AddRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { updateToken } from 'modules/wallet.reducer';


class Create extends Component {
  constructor() {
    super();

    this.state = {
      message: '',
      tokenData: {},
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
    return sol.getTokenData(token).then(re => {
      return this.setState({ tokenData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  newAccount = () => {
    const { wallet: { tokens, secretKey }, updateToken } = this.props;
    const { tokenData: { initialized, token } } = this.state;
    if (!initialized) return console.error('Invalid input');

    const payer = sol.fromSecretKey(secretKey);
    const tokenPublicKey = sol.fromAddress(token.address);
    return sol.newSRC20Account(tokenPublicKey, payer).then(re => {
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
    const { tokenData: { address, initialized, token }, counter, message } = this.state;
    if (!initialized) return null;
    const symbol = token.symbol.join('').replace('-', '');
    const percentage = Math.round((10000 - counter) / 10000 * 100);

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Create a new token account</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label={symbol}
          variant="outlined"
          color="primary"
          value={address}
          InputProps={{
            endAdornment: percentage ? <CircularProgress
              variant="determinate"
              size={16}
              value={percentage}
            /> : <IconButton color="primary" onClick={this.newAccount}>
                <AddRounded />
              </IconButton>
          }}
          helperText={message}
          fullWidth
        />
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