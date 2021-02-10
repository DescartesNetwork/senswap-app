import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { EmojiObjectsRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet } from 'modules/wallet.reducer';


const EMPTY = {
  loading: false,
  txId: '',
  tokenAddress: '',
}

class CreateTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY
    }

    this.src20 = window.senwallet.src20;
  }

  onTokenAddress = (e) => {
    const tokenAddress = e.target.value || '';
    return this.setState({ tokenAddress });
  }

  newAccount = () => {
    const {
      wallet: { user },
      setError,
      updateWallet, unlockWallet
    } = this.props;
    const { tokenAddress } = this.state;
    if (!ssjs.isAddress(tokenAddress)) return setError('The account address cannot be empty');

    let txId = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        return sol.newSRC20Account(tokenAddress, secretKey);
      }).then(({ account, txId: refTxId }) => {
        txId = refTxId;
        const tokens = [...user.tokens];
        if (!tokens.includes(tokenAddress)) tokens.push(tokenAddress);
        return updateWallet({ ...user, tokens });
      }).then(_ => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { tokenAddress, loading } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">New account</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Token Address"
          variant="outlined"
          color="primary"
          onChange={this.onTokenAddress}
          value={tokenAddress}
          InputProps={{
            endAdornment: <IconButton
              color="primary"
              onClick={this.newAccount}
              edge="end"
              disabled={loading}
            >
              {loading ? <CircularProgress size={17} /> : <EmojiObjectsRounded />}
            </IconButton>
          }}
          disabled={loading}
          fullWidth
        />
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
)(withStyles(styles)(CreateTokenAccount)));