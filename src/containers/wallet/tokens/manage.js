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
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import CircularProgress from '@material-ui/core/CircularProgress';

import { CloseRounded, WidgetsRounded, RemoveCircleOutlineRounded } from '@material-ui/icons';

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
      loading: false,
      error: '',
      data: {},
      values: []
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
      return sol.getTokenAccountData(token);
    })).then(values => {
      return this.setState({ values });
    }).catch(er => {
      return console.error(er);
    });
  }

  onToken = (e) => {
    const token = e.target.value || '';
    return this.setState({ token, loading: true, error: '' }, () => {
      if (token.length !== 44) return this.setState({ loading: false, data: {}, error: 'Invalid address length' });
      return sol.getTokenAccountData(token).then(data => {
        return this.setState({ loading: false, data, error: '' });
      }).catch(er => {
        return this.setState({ loading: false, data: {}, error: er });
      })
    });
  }

  addToken = () => {
    const { token, loading, error } = this.state;
    if (loading) return this.setState({ error: 'Validating token' });
    if (error) return this.setState({ error });
    if (!token) return this.setState({ error: 'Empty token' });
    const { wallet: { tokens }, updateToken } = this.props;
    const newTokens = [...tokens];
    newTokens.push(token);
    return updateToken(newTokens).then(re => {
      return this.setState({ loading: false, data: {}, error: '', token: '' });
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
    const { data: { amount, decimals, owner, symbol, token, total_supply } } = this.state;
    if (!token) return null;
    return <Grid container spacing={2}>
      <Grid item xs={6}>
        <TextField
          label={symbol.join('').replace('-', '')}
          variant="outlined"
          color="primary"
          value={token}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Total Supply"
          variant="outlined"
          color="primary"
          value={total_supply.toString()}
          helperText={`Decimals: ${decimals}`}
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
    const { classes } = this.props;
    const { wallet: { tokens } } = this.props;
    const { values } = this.state;
    return <Grid container spacing={2}>
      {values.map((value, index) => {
        const address = tokens[index];
        if (!address) return null;
        const symbol = value.symbol.join('').replace('-', '');
        const token = value.token;
        const balance = (value.amount / global.BigInt(10 ** value.decimals)).toString();
        const balanceDecimals = (value.amount % global.BigInt(10 ** value.decimals)).toString();
        const totalSupply = (value.total_supply / global.BigInt(10 ** value.decimals)).toString();
        const totalSupplyDecimals = (value.total_supply % global.BigInt(10 ** value.decimals)).toString();

        return <Grid key={address} item xs={12}>
          <Grid item container className={classes.noWrap} spacing={2}>
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
    const { visible, loading, token, error } = this.state;

    return <Fragment>
      <Tooltip title="Add/Remove your token accounts">
        <IconButton onClick={this.onOpen} size="small" color="primary">
          <WidgetsRounded />
        </IconButton>
      </Tooltip>
      <Dialog open={visible} onClose={this.onClose}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6">Manage your token accounts</Typography>
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
                      endAdornment: loading ? <CircularProgress size={16} /> : null
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item>
                  <Button color="primary" onClick={this.addToken} size="large">
                    <Typography>OK</Typography>
                  </Button>
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