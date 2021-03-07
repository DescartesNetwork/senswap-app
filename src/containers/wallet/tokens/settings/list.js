import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { getAccountData } from 'modules/bucket.reducer';


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
      wallet: { accounts },
      setError,
      getMints, getMint,
      getAccountData,
    } = this.props;

    let data = null;
    return Promise.all(accounts.map(accountAddress => {
      return getAccountData(accountAddress);
    })).then(re => {
      data = re;
      return Promise.all(data.map(({ mint: { address } }) => {
        return getMints({ address });
      }));
    }).then(re => {
      const mintIds = re.map(([mintId]) => (mintId || { _id: null }));
      return Promise.all(mintIds.map(({ _id }) => {
        return getMint(_id).then(data => {
          return Promise.resolve(data);
        }).catch(er => {
          return Promise.resolve({});
        });
      }));
    }).then(re => {
      data = data.map((accountData, i) => {
        const newAccountData = { ...accountData }
        newAccountData.mint = { ...accountData.mint, ...re[i] }
        return newAccountData;
      });
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
      {data.map(({ address, amount, state, mint }) => {
        if (!state) return null;
        const balance = utils.prettyNumber(utils.div(amount, global.BigInt(10 ** mint.decimals)));
        const totalSupply = utils.prettyNumber(utils.div(mint.supply, global.BigInt(10 ** mint.decimals)));

        return <Grid key={address} item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label={mint.symbol}
                variant="outlined"
                color="primary"
                value={address}
                helperText={`Token: ${mint.address}`}
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
  mint: state.mint,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
  getMints, getMint,
  updateWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ListTokenAccount)));