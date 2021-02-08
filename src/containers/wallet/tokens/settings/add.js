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

import { AddRounded } from '@material-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { updateWallet, setMainAccount } from 'modules/wallet.reducer';


class AddTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
      tokenAccount: '',
      data: {},
    }

    this.src20 = window.senwallet.src20;
  }

  onTokenAccount = (e) => {
    const { setError } = this.props;
    const tokenAccount = e.target.value || '';
    return this.setState({ tokenAccount }, () => {
      return this.src20.getAccountData(tokenAccount).then(re => {
        return this.setState({ data: re });
      }).catch(er => {
        return this.setState({ data: {} }, () => {
          return setError(er);
        });
      });
    });
  }

  addToken = () => {
    const {
      wallet: { user },
      setError,
      updateWallet, setMainAccount
    } = this.props;
    const { tokenAccount } = this.state;
    if (!tokenAccount) return setError('Token account cannot be empty');
    if (user.tokenAccounts.includes(tokenAccount)) return setError('Token is in list already');

    const tokenAccounts = [...user.tokenAccounts];
    tokenAccounts.push(tokenAccount);
    return updateWallet({ ...user, tokenAccounts }).then(re => {
      return setMainAccount(tokenAccount);
    }).then(re => {
      return this.setState({ data: {}, tokenAccount: '' });
    }).catch(er => {
      return setError(er);
    });
  }

  renderTokenInfo = () => {
    const { data: { amount, initialized, owner, token } } = this.state;
    if (!initialized) return null;
    return <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label={ssjs.toSymbol(token.symbol)}
          variant="outlined"
          color="primary"
          value={token.address}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Total Supply"
          variant="outlined"
          color="primary"
          value={token.total_supply.toString()}
          helperText={`Decimals: ${token.decimals}`}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Owner address"
          variant="outlined"
          color="primary"
          value={owner}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Balance"
          variant="outlined"
          color="primary"
          value={amount.toString()}
          fullWidth
        />
      </Grid>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { tokenAccount } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Add an existed token account</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
          <Grid item className={classes.stretch}>
            <TextField
              label="Add a token account"
              variant="outlined"
              color="primary"
              onChange={this.onTokenAccount}
              value={tokenAccount}
              InputProps={{
                endAdornment:
                  <IconButton color="primary" onClick={this.addToken} edge="end" >
                    <AddRounded />
                  </IconButton>
              }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {this.renderTokenInfo()}
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
  updateWallet, setMainAccount,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddTokenAccount)));