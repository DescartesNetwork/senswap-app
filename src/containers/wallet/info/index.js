import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import { Grid, IconButton } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';

import { PowerSettingsNewRounded, RemoveCircleOutlineRounded, AddRounded } from '@material-ui/icons';

import AccountInfo from './account';

import styles from './styles';
import utils from 'helpers/utils';
import { closeWallet, unsetWallet, updateToken } from 'modules/wallet.reducer';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      error: '',
      token: '',
      values: [],
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
    const { wallet: { tokens } } = this.props;
    return Promise.all(tokens.map(token => {
      return utils.getTokenAccountData(token);
    })).then(values => {
      return this.setState({ values });
    }).catch(er => {
      return console.error(er);
    });
  }

  disconnect = () => {
    return this.props.unsetWallet().then(re => {
      return this.props.closeWallet();
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
    const newTokens = [...tokens];
    if (!token) return console.error('Invalid input');
    newTokens.push(token);
    return updateToken(newTokens).then(re => {
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

  renderToken = () => {
    const { classes } = this.props;
    const { wallet: { tokens } } = this.props;
    const { token, values } = this.state;

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
      {tokens.map((address, index) => {
        const value = values[index];
        if (!value) return null;
        const symbol = value.symbol.join('').replace('-', '');
        const token = value.token;
        const balance = (value.amount / global.BigInt(10 ** value.decimals)).toString();
        const balanceDecimals = (value.amount % global.BigInt(10 ** value.decimals)).toString();
        const totalSupply = (value.total_supply / global.BigInt(10 ** value.decimals)).toString();
        const totalSupplyDecimals = (value.total_supply % global.BigInt(10 ** value.decimals)).toString();

        return <Grid item key={address} xs={12}>
          <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
            <Grid item>
              <IconButton
                color="secondary"
                onClick={() => this.removeToken(address)}
                size="small"
              >
                <RemoveCircleOutlineRounded />
              </IconButton>
            </Grid>
            <Grid item className={classes.stretch}>
              <TextField
                label={symbol}
                variant="outlined"
                color="primary"
                value={address}
                size="small"
                helperText={token}
                fullWidth
              />
            </Grid>
            <Grid item>
              <TextField
                label="Balance"
                variant="outlined"
                color="primary"
                value={Number(balance + '.' + balanceDecimals)}
                helperText={Number(totalSupply + '.' + totalSupplyDecimals)}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
      })}
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

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <AccountInfo />
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