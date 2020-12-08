import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid, IconButton } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import { PowerSettingsNewRounded, DeleteForeverRounded, AddRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { closeWallet, unsetWallet, updateToken } from 'modules/wallet.reducer';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      balance: 0,
      error: '',
      token: '',
    }
  }

  disconnect = () => {
    return this.props.unsetWallet().then(re => {
      return this.props.closeWallet();
    }).catch(er => {
      return this.setState({ error: er });
    });
  }

  getBalance = () => {
    const { wallet: { address } } = this.props;
    return utils.getBalance(address).then(re => {
      return this.setState({ balance: re });
    }).catch(er => {
      return this.setState({ error: er });
    });
  }

  onToken = (e) => {
    const token = e.target.value || '';
    return this.setState({ token });
  }

  addToken = () => {
    const { token } = this.state;
    const { wallet: { tokens }, updateToken } = this.props;
    if (!token) return console.error('Invalid input');
    tokens.push(token);
    return updateToken(tokens).then(re => {
      return this.setState({ token: '' });
    }).catch(er => {
      return this.setState({ error: er });
    });
  }

  removeToken = (address) => {
    const { wallet: { tokens }, updateToken } = this.props;
    const newTokens = tokens.filter(token => token !== address);
    return updateToken(newTokens);
  }

  renderInfo = () => {
    const { classes } = this.props;
    const { wallet: { address } } = this.props;
    const { balance } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <Typography variant="body2">Account</Typography>
          </Grid>
          <Grid item className={classes.stretch}>
            <Divider />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      <Grid item xs={8}>
        <TextField
          label="Address"
          variant="outlined"
          color="primary"
          value={address}
          size="small"
          fullWidth
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          label="SOL"
          variant="outlined"
          color="primary"
          value={balance}
          size="small"
          fullWidth
        />
      </Grid>
    </Grid>
  }

  renderToken = () => {
    const { classes } = this.props;
    const { wallet: { tokens } } = this.props;
    const { token } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item>
            <Typography variant="body2">Assets</Typography>
          </Grid>
          <Grid item className={classes.stretch}>
            <Divider />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</Typography>
      </Grid>
      {tokens.map(address => <Grid item key={address} xs={12}>
        <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
          <Grid item>
            <IconButton
              color="secondary"
              onClick={() => this.removeToken(address)}
              size="small"
            >
              <DeleteForeverRounded />
            </IconButton>
          </Grid>
          <Grid item className={classes.stretch}>
            <TextField
              label="Token"
              variant="outlined"
              color="primary"
              value={address}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Balance"
              variant="outlined"
              color="primary"
              value={0}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>)}
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
          <Grid item className={classes.stretch}>
            <TextField
              label="New token"
              variant="outlined"
              color="primary"
              onChange={this.onToken}
              value={token}
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.addToken}
              startIcon={<AddRounded />}
              fullWidth
            >
              <Typography>Add</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }

  render() {
    const { error } = this.state;
    this.getBalance();

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        {this.renderInfo()}
      </Grid>
      <Grid item xs={12}>
        {this.renderToken()}
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={this.disconnect}
          startIcon={<PowerSettingsNewRounded />}
          fullWidth
        >
          <Typography>Disconnect</Typography>
        </Button>
      </Grid>
      {error ? <Grid item xs={12}>
        <Typography>{error}</Typography>
      </Grid> : null}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  closeWallet, unsetWallet, updateToken
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Info)));