import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { } from '@material-ui/icons';

import styles from './styles';
import utils from 'helpers/utils';
import { } from 'modules/wallet.reducer';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      error: '',
      value: {},
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
    const { wallet: { token } } = this.props;
    return utils.getTokenAccountData(token).then(value => {
      return this.setState({ value });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { wallet: { token: address } } = this.props;
    const { value } = this.state;
    if (!value.token) return null;
    const symbol = value.symbol.join('').replace('-', '');
    const balance = (value.amount / global.BigInt(10 ** value.decimals)).toString();
    const balanceDecimals = (value.amount % global.BigInt(10 ** value.decimals)).toString();

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} alignItems="center" spacing={2}>
          <Grid item className={classes.stretch}>
            <TextField
              label={symbol}
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
              value={Number(balance + '.' + balanceDecimals)}
              size="small"
              fullWidth
            />
          </Grid>
        </Grid>
      </Grid>
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
)(withStyles(styles)(Info)));