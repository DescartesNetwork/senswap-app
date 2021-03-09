import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import { FlightTakeoffRounded, HelpOutlineRounded } from '@material-ui/icons';

import Ban from 'components/ban';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { unlockWallet } from 'modules/wallet.reducer';
import { addMint } from 'modules/mint.reducer';

const EMPTY = {
  loading: false,
  ok: false,
}

class RegisterMint extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,
      data: {},
      name: '',
      cgk: 'https://api.coingecko.com/api/v3/coins/',
    }
  }

  onSubmit = () => {
    const { data } = this.state;
    const { addMint, unlockWallet, setError } = this.props;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(secretKey => {
        return addMint(data, secretKey);
      }).then(re => {
        return this.setState({ ...EMPTY, ok: true });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  onAddress = (e) => {
    const { data } = this.state;
    const address = e.target.value || '';
    return this.setState({ data: { ...data, address } });
  }

  onName = (e) => {
    const { setError } = this.props;
    const name = e.target.value || '';
    const cgk = 'https://api.coingecko.com/api/v3/coins/' + name.toLowerCase();
    return this.setState({ ...EMPTY, data: {}, name, cgk }, () => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      if (!name) return;
      this.timeoutId = setTimeout(() => {
        return this.setState({ loading: true }, () => {
          return ssjs.parseCGK(cgk).then(data => {
            return this.setState({ ...EMPTY, data });
          }).catch(er => {
            return this.setState({ ...EMPTY }, () => {
              return setError('Cannot find data for the coin/token');
            });
          });
        });
      }, 1000);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { role } } } = this.props;
    const { loading, data, name, cgk, ok } = this.state;

    if (!['admin', 'operator'].includes(role)) return <Ban />
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">CoinGecko Magic</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label="Coin/Token name"
          value={name}
          onChange={this.onName}
          InputProps={{
            startAdornment: <Tooltip title="The token info will be automatically parsed from CoinGecko.">
              <IconButton edge="start">
                <HelpOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>,
            endAdornment: loading ? <IconButton edge="end">
              <CircularProgress size={17} />
            </IconButton> : null
          }}
          placeholder="bitcoin"
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          label={(data.name || 'Unknown') + ' / ' + (data.symbol || 'Unknown')}
          InputProps={{
            startAdornment: <Avatar src={data.icon} className={classes.icon}>
              <HelpOutlineRounded />
            </Avatar>
          }}
          onChange={this.onAddress}
          value={data.address || ''}
          helperText={`Parsing from ${cgk}`}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="flex-end">
          <Grid item className={classes.stretch}>
            <Typography variant="body2">{ok ? 'Done!' : ''}</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={this.onSubmit}
              endIcon={<FlightTakeoffRounded />}
              disabled={loading}
            >
              <Typography>Submit</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  mint: state.mint,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet,
  addMint,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RegisterMint)));