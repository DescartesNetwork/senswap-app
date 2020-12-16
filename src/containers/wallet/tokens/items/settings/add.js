import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { AddRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import { updateToken } from 'modules/wallet.reducer';


class AddTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
      token: '',
      error: '',
      tokenData: {},
    }
  }

  onToken = (e) => {
    const token = e.target.value || '';
    return this.setState({ token, error: '' }, () => {
      return sol.getTokenData(token).then(re => {
        return this.setState({ tokenData: re, error: '' });
      }).catch(er => {
        return this.setState({ tokenData: {}, error: er });
      });
    });
  }

  addToken = () => {
    const { token, error } = this.state;
    if (error) return this.setState({ error });
    if (!token) return this.setState({ error: 'Empty token' });
    const { wallet: { tokens }, updateToken } = this.props;
    const newTokens = [...tokens];
    newTokens.push(token);
    return updateToken(newTokens).then(re => {
      return this.setState({ tokenData: {}, error: '', token: '' });
    }).catch(er => {
      return this.setState({ error: er });
    });
  }

  renderTokenInfo = () => {
    const { tokenData: { amount, initialized, owner, token } } = this.state;
    if (!initialized) return null;
    const symbol = token.symbol.join('').replace('-', '');
    return <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label={symbol}
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
    const { token, error } = this.state;

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
              onChange={this.onToken}
              value={token}
              error={Boolean(error)}
              helperText={error}
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
  updateToken,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddTokenAccount)));