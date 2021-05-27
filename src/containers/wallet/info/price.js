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

  fetchData = async () => {
    const { wallet: { accounts, lamports }, getAccountData } = this.props;

    this.setState({ loading: true });
    let data = [{
      amount: global.BigInt(lamports),
      mint: { decimals: 9, ticket: 'solana' }
    }];
    for (const accountAddress of accounts) {
      try {
        const accountData = await getAccountData(accountAddress);
        const { pool, mint } = accountData;
        const { address: poolAddress } = pool || {}
        const { ticket } = mint || {}
        if (!ssjs.isAddress(poolAddress) && ticket) data.push(accountData);
      } catch (er) { /* Nothing */ }
    }
    let btc = 0;
    let usd = 0;
    for (const datum of data) {
      try {
        const { amount, mint: { ticket, decimals } } = datum;
        const balance = ssjs.undecimalize(amount, decimals);
        const { btc: b, usd: u } = await utils.fetchValue(balance, ticket);
        btc = btc + b;
        usd = usd + u;
      } catch (er) { /* Nothing */ }
    }
    return this.setState({ usd, btc, loading: false });
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