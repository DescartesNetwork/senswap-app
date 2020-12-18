import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';

import { RemoveRounded } from '@material-ui/icons';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { updateToken } from 'modules/wallet.reducer';


class ListTokenAccount extends Component {
  constructor() {
    super();

    this.state = {
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

  removeToken = (address) => {
    const { wallet: { tokens }, updateToken } = this.props;
    const newTokens = tokens.filter(token => token !== address);
    return updateToken(newTokens);
  }

  render() {
    const { tokensData } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body2">Your accounts</Typography>
      </Grid>
      {tokensData.map(({ address, amount, initialized, token }) => {
        if (!initialized) return null;
        const symbol = token.symbol.join('').replace('-', '');
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
                InputProps={{
                  startAdornment: <IconButton
                    color="primary"
                    onClick={() => this.removeToken(address)}
                    edge="start"
                  >
                    <RemoveRounded />
                  </IconButton>
                }}
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
  updateToken,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ListTokenAccount)));