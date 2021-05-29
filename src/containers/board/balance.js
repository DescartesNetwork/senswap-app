import React, { Component, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Paper from 'senswap-ui/paper';
import Button from 'senswap-ui/button';
import Divider from 'senswap-ui/divider';
import Avatar from 'senswap-ui/avatar';
import Drain from 'senswap-ui/drain';

import { SwapCallsRounded, HelpOutlineRounded } from 'senswap-ui/icons';

import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import { getAccountData } from 'modules/bucket.reducer';


function Valuation(props) {
  const [value, setValue] = useState(0);
  const { balance, ticket } = props;
  useEffect(() => {
    return (async () => {
      try {
        const { price } = await ssjs.parseCGK(ticket);
        setValue(price * balance);
      } catch (er) { /* Do nothing */ }
    })();
  }, [balance, ticket]);
  return '$' + numeral(value).format('0,0.[000000]');
}

class Balance extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolData: prevPoolData, wallet: { lpts: prevLPTs } } = prevProps;
    const { poolData, wallet: { lpts } } = this.props;
    if (!isEqual(prevPoolData, poolData)) this.fetchData();
    if (!isEqual(prevLPTs, lpts)) this.fetchData();
  }

  fetchData = async () => {
    const { poolData } = this.props;
    const { mint_s, mint_a, mint_b } = poolData;
    const { address: mintSAddress } = mint_s || {};
    const { address: mintAAddress } = mint_a || {};
    const { address: mintBAddress } = mint_b || {};
    const mintAddresses = [mintSAddress, mintAAddress, mintBAddress];
    this.setState({ loading: true });
    let data = [];
    for (const mintAddress of mintAddresses) {
      try {
        const accountData = await this.fetchAccountData(mintAddress);
        data.push(accountData);
      } catch (er) { /* Nothing */ }
    }
    return this.setState({ loading: false, data });
  }

  fetchAccountData = async (mintAddress) => {
    const { wallet: { user: { address: walletAddress } }, getAccountData } = this.props;
    if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
    if (!ssjs.isAddress(walletAddress)) throw new Error('Invalid wallet address');
    this.setState({ loading: true });
    const { address: accountAddress, state } = await sol.scanAccount(mintAddress, walletAddress);
    if (!state) throw new Error('Invalid state');
    const data = await getAccountData(accountAddress);
    return data;
  }

  render() {
    const { classes, poolData } = this.props;
    const { data, loading } = this.state;
    const { address: poolAddress } = poolData;

    return <Paper className={classes.paper}>
      <BucketWatcher
        addresses={data.map(({ address }) => address)}
        onChange={this.fetchData}
      />
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Your Assets</Typography>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        {data.map((accountData, index) => {
          const { amount, mint } = accountData;
          const { symbol, icon, ticket, decimals } = mint || {};
          const balance = ssjs.undecimalize(amount, decimals);
          return <Fragment key={index}>
            {index ? <Grid item xs={12}><Divider /></Grid> : null}
            <Grid item xs={12}>
              <Grid container className={classes.noWrap} alignItems="center">
                <Grid item>
                  <Avatar src={icon} className={classes.icon} >
                    <HelpOutlineRounded />
                  </Avatar>
                </Grid>
                <Grid item className={classes.stretch}>
                  <Typography>{symbol}</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid item xs={12}>
                      <Typography align="right">{numeral(balance).format('0,0.[000000]')}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary" align="right">
                        <Valuation balance={balance} ticket={ticket} />
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        })}
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<SwapCallsRounded />}
            component={RouterLink}
            to={`/swap/${poolAddress}`}
            disabled={loading}
            fullWidth
          >
            <Typography>Swap</Typography>
          </Button>
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getAccountData,
}, dispatch);

Balance.defaultProps = {
  poolData: {},
}

Balance.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Balance)));