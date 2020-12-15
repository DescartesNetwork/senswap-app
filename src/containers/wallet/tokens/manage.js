import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import { CloseRounded, SettingsRounded, RemoveRounded, AddRounded } from '@material-ui/icons';

import Drain from 'components/drain';

import styles from './styles';
import sol from 'helpers/sol';
import { updateToken } from 'modules/wallet.reducer';


class Manage extends Component {
  constructor() {
    super();

    this.state = {
      visible: false,
      token: '',
      error: '',
      tokenData: {},
      tokensData: []
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
      return sol.getTokenData(token);
    })).then(re => {
      return this.setState({ tokensData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  onToken = (e) => {
    const token = e.target.value || '';
    return this.setState({ token, error: '' }, () => {
      return sol.getTokenData(token).then(re => {
        return this.setState({ tokenData: re, error: '' });
      }).catch(er => {
        return this.setState({ tokenData: {}, error: er });
      })
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

  removeToken = (address) => {
    const { wallet: { tokens }, updateToken } = this.props;
    const newTokens = tokens.filter(token => token !== address);
    return updateToken(newTokens);
  }

  onClose = () => {
    return this.setState({ visible: false });
  }

  onOpen = () => {
    return this.setState({ visible: true });
  }

  renderTokenInfo = () => {
    const { tokenData: { address, amount, initialized, owner, token } } = this.state;
    if (!initialized) return null;
    const symbol = token.symbol.join('').replace('-', '');
    return <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label={symbol}
          variant="outlined"
          color="primary"
          value={address}
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

  renderTokenList = () => {
    const { tokensData } = this.state;
    return <Grid container spacing={2}>
      {tokensData.map(({ address, amount, initialized, token }) => {
        if (!initialized) return null;
        const symbol = token.symbol.join('').replace('-', '');
        const balance = (amount / global.BigInt(10 ** token.decimals)).toString();
        const balanceDecimals = (amount % global.BigInt(10 ** token.decimals)).toString();
        const totalSupply = (token.total_supply / global.BigInt(10 ** token.decimals)).toString();
        const totalSupplyDecimals = (token.total_supply % global.BigInt(10 ** token.decimals)).toString();

        return <Grid key={address} item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label={symbol}
                variant="outlined"
                color="primary"
                value={address}
                helperText={`Token: ${token.address}`}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Balance"
                variant="outlined"
                color="primary"
                value={Number(balance + '.' + balanceDecimals)}
                helperText={`Total supply: ${Number(totalSupply + '.' + totalSupplyDecimals)}`}
                InputProps={{
                  endAdornment: <IconButton color="primary" onClick={() => this.removeToken(address)}>
                    <RemoveRounded />
                  </IconButton>
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
      })}
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { visible, token, error } = this.state;

    return <Fragment>
      <Tooltip title="Add/Remove your token accounts">
        <IconButton onClick={this.onOpen} size="small" color="primary">
          <SettingsRounded />
        </IconButton>
      </Tooltip>
      <Dialog open={visible} onClose={this.onClose}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Token Settings</Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={this.onClose}>
                <CloseRounded />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              {this.renderTokenList()}
            </Grid>

            <Grid item xs={12}>
              <Drain small />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2">TL;DR. The address should be an token account address.</Typography>
              <Typography>A token address is to store token information like decimals, total supply, token name and others, which are automatically loaded. Otherwise, a token account address is to store your information like balance, owner of the token. So, please enter your token account address.</Typography>
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
                        <IconButton color="primary" variant="contained" onClick={this.addToken}>
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
        </DialogContent>
        <DialogActions>
          {/* Nothing */}
        </DialogActions>
      </Dialog>
    </Fragment>
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
)(withStyles(styles)(Manage)));