import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import sol from 'helpers/sol';
import styles from './styles';


class Info extends Component {
  constructor() {
    super();

    this.state = {
      tokenData: {},
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
    return sol.getTokenData(token).then(re => {
      return this.setState({ tokenData: re });
    }).catch(er => {
      return console.error(er);
    });
  }

  render() {
    const { wallet: { address: payerAddress } } = this.props;
    const { tokenData: { address, amount, initialized, owner, token } } = this.state;
    if (!initialized) return null;
    const symbol = token.symbol.join('').replace('-', '');
    const balance = (amount / global.BigInt(10 ** token.decimals)).toString();
    const balanceDecimals = (amount % global.BigInt(10 ** token.decimals)).toString();

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Info</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              label={symbol}
              variant="outlined"
              color="primary"
              value={address}
              error={payerAddress !== owner}
              helperText={
                payerAddress !== owner ?
                  `The owner, ${owner}, is unmatched to the main account`
                  :
                  `Token: ${token.address}`
              }
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Balance"
              variant="outlined"
              color="primary"
              value={Number(balance + '.' + balanceDecimals)}
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