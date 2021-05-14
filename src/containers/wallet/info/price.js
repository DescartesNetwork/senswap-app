import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';
import isEqual from 'react-fast-compare';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Chip from 'senswap-ui/chip';
import CircularProgress from 'senswap-ui/circularProgress';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Price extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      usd: 0,
      btc: 0,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts } } = prevProps;
    const { wallet: { accounts } } = this.props;
    if (!isEqual(prevAccounts, accounts)) this.fetchData();
  }

  fetchData = () => {
    const { wallet: { accounts, lamports }, setError, getAccountData } = this.props;

    const solAccount = {
      amount: global.BigInt(lamports),
      mint: { decimals: 9, ticket: 'solana' }
    }

    return this.setState({ loading: true }, () => {
      return accounts.each(accountAddress => {
        return getAccountData(accountAddress);
      }, { skipError: true, skipIndex: true }).then(data => {
        data = data.filter(({ pool, mint }) => {
          const { address: poolAddress } = pool || {}
          const { ticket } = mint || {}
          return !ssjs.isAddress(poolAddress) && ticket;
        });
        data.unshift(solAccount);
        return data.each(({ amount, mint: { decimals, ticket } }) => {
          const balance = ssjs.undecimalize(amount, decimals);
          return utils.fetchValue(balance, ticket);
        });
      }).then(data => {
        const usd = data.map(({ usd }) => usd).reduce((a, b) => a + b, 0);
        const btc = data.map(({ btc }) => btc).reduce((a, b) => a + b, 0);
        return this.setState({ usd, btc, loading: false });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes, ui: { width } } = this.props;
    const { loading, btc, usd } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item>
            {loading ? <CircularProgress size={17} /> :
              <Typography variant={width < 600 ? 'h5' : 'h4'}>{utils.prettyNumber(btc) || '0'}</Typography>}
          </Grid>
          <Grid item className={classes.stretch}>
            <Chip label={<Typography variant="h6">BTC</Typography>} color="#FF9F38" />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {!loading ? <Typography variant="subtitle1" color="textSecondary">{utils.prettyNumber(usd)} USD</Typography> : null}
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Price)));