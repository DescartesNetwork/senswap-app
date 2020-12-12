import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { FlightTakeoffRounded } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';


class Transfer extends Component {
  constructor() {
    super();

    this.state = {
      amount: 0,
      destination: '',
      error: '',
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

  onAmount = (e) => {
    const amount = e.target.value;
    return this.setState({ amount });
  }

  onDestination = (e, value) => {
    const destination = value || '';
    return this.setState({ destination });
  }

  transfer = () => {
    const { amount, destination } = this.state;
    if (!parseFloat(amount)) return this.setState({ error: 'Invalid amount' });
    if (!destination) return this.setState({ error: 'Empty destination' });
    if (destination.length !== 44) return this.setState({ error: 'Invalid address length' });
    return this.setState({ error: '' }, () => {
      console.log(amount, destination);
    })
  }

  render() {
    const { classes } = this.props;
    const { amount, error, values } = this.state;
    const { wallet: { tokens } } = this.props;
    const options = values.map((value, index) => ({
      symbol: value.symbol.join('').replace('-', ''),
      address: tokens[index] || ''
    }));

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Transfer</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap} spacing={2}>
          <Grid item className={classes.stretch}>
            <Autocomplete
              options={options}
              getOptionLabel={option => option.address}
              getOptionSelected={(option, value) => option.address === value}
              renderOption={option => <Typography>{`${option.symbol} - ${option.address}`}</Typography>}
              renderInput={params => <TextField {...params} label="Destination" variant="outlined" />}
              onInputChange={this.onDestination}
              freeSolo
              fullWidth
            />
          </Grid>
          <Grid item>
            <TextField
              label="Amount"
              variant="outlined"
              onChange={this.onAmount}
              value={amount}
              fullWidth
            />
          </Grid>
          <Grid item>
            <Button color="primary" startIcon={<FlightTakeoffRounded />} onClick={this.transfer}>
              <Typography>Transfer</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {error ? <Grid item xs={12}>
        <Typography color="error" className={classes.error}>{error}</Typography>
      </Grid> : null}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Transfer)));