import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Tooltip from 'senswap-ui/tooltip';
import Button, { IconButton } from 'senswap-ui/button';
import Avatar from 'senswap-ui/avatar';
import CircularProgress from 'senswap-ui/circularProgress';

import TextField from '@material-ui/core/TextField';

import { FlightTakeoffRounded, HelpOutlineRounded } from 'senswap-ui/icons';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { addMint } from 'modules/mint.reducer';
import Utils from 'helpers/utils';

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
    }
  }

  onSubmit = () => {
    const { data } = this.state;
    const { addMint, setError } = this.props;
    return this.setState({ loading: true }, () => {
      return addMint(data).then(re => {
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
    const ticket = name.toLowerCase();
    return this.setState({ ...EMPTY, data: {}, name }, () => {
      if (this.timeoutId) clearTimeout(this.timeoutId);
      if (!name) return;
      this.timeoutId = setTimeout(() => {
        return this.setState({ loading: true }, () => {
          return Utils.fetchCGK(ticket).then(data => {
            return this.setState({ ...EMPTY, data: { ...data, ticket } });
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
    const { loading, data, name, ok } = this.state;

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
          placeholder="Token Address"
          onChange={this.onAddress}
          value={data.address || ''}
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
  addMint,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(RegisterMint)));