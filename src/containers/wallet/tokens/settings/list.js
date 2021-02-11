import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import { } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { unlockWallet, updateWallet } from 'modules/wallet.reducer';


class ListTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { user: prevUser } } = prevProps;
    const { wallet: { user } } = this.props;
    if (!isEqual(user, prevUser)) this.fetchData();
  }

  fetchData = () => {
    const {
      wallet: { user: { tokens } },
      setError,
      unlockWallet,
    } = this.props;
    return unlockWallet().then(secretKey => {
      return Promise.all(tokens.map(tokenAddress => {
        return sol.scanSRC20Account(tokenAddress, secretKey);
      }));
    }).then(data => {
      data = data.map(({ data }) => data).flat();
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { data } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Your accounts</Typography>
      </Grid>
      {data.map(({ address, amount, initialized, token }) => {
        if (!initialized) return null;
        const symbol = ssjs.toSymbol(token.symbol);
        const balance = utils.prettyNumber(utils.div(amount, global.BigInt(10 ** token.decimals)));
        const totalSupply = utils.prettyNumber(utils.div(token.total_supply, global.BigInt(10 ** token.decimals)));

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
                value={balance}
                helperText={`Total supply: ${totalSupply}`}
                fullWidth
              />
            </Grid>
          </Grid>
        </Grid>
      })}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unlockWallet, updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ListTokenAccount)));