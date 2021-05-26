import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Card, { CardContent } from 'senswap-ui/card';
import Typography from 'senswap-ui/typography';
import Avatar, { AvatarGroup } from 'senswap-ui/avatar';
import Divider from 'senswap-ui/divider';
import Button, { IconButton } from 'senswap-ui/button';
import Tooltip from 'senswap-ui/tooltip';

import {
  AccountBalanceWalletOutlined, InputRounded, OpenInNewRounded,
  OfflineBoltRounded,
} from 'senswap-ui/icons';

import AddLiquidity from 'containers/pool/addLiquidity';
import RemoveLiquidity from 'containers/pool/removeLiquidity';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getAccountData, getPoolData } from 'modules/bucket.reducer';
import { openWallet } from 'modules/wallet.reducer';


class PoolCard extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visibleDeposit: false,
      visibleWithdraw: false,
      data: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { lpts: prevLPTs }, poolAddress: prevPoolAddress } = prevProps;
    const { wallet: { lpts }, poolAddress } = this.props;
    if (!isEqual(prevLPTs, lpts)) return this.fetchData();
    if (!isEqual(prevPoolAddress, poolAddress)) return this.fetchData();
  }

  fetchData = async () => {
    const {
      poolAddress, getPoolData, getAccountData,
      wallet: { user: { address: payerAddress } }
    } = this.props;
    try {
      // Get pool data
      let data = await getPoolData(poolAddress);
      // Get TVL ($)
      const {
        reserve_a: reserveA, mint_a: { ticket: ticketA, decimals: decimalsA },
        reserve_b: reserveB, mint_b: { ticket: ticketB, decimals: decimalsB },
        reserve_s: reserveS, mint_s: { ticket: ticketS, decimals: decimalsS }
      } = data;
      const syntheticData = [
        [ssjs.undecimalize(reserveA, decimalsA), ticketA],
        [ssjs.undecimalize(reserveB, decimalsB), ticketB],
        [ssjs.undecimalize(reserveS, decimalsS), ticketS]
      ];
      const re = await Promise.all(syntheticData.map(([balance, ticket]) => utils.fetchValue(balance, ticket)));
      const usd = re.map(({ usd }) => usd).reduce((a, b) => a + b, 0);
      data.usd = usd;
      // Check user's stake
      const { mint_lpt: { address: mintAddress } } = data;
      if (!ssjs.isAddress(payerAddress)) return this.setState({ data });
      const { address: accountAddress, state } = await sol.scanAccount(mintAddress, payerAddress);
      if (state) data.accountData = await getAccountData(accountAddress);
      return this.setState({ data });
    } catch (er) { /* Nothing */ }
  }

  onOpenDeposit = () => this.setState({ visibleDeposit: true });
  onCloseDeposit = () => this.setState({ visibleDeposit: false });

  onOpenWithdraw = () => this.setState({ visibleWithdraw: true });
  onCloseWithdraw = () => this.setState({ visibleWithdraw: false });

  onAction = () => {
    const { data, visibleDeposit, visibleWithdraw } = this.state;
    // Empty
    const { address: poolAddress, accountData } = data;
    if (!ssjs.isAddress(poolAddress)) return null;
    // Connect wallet
    const { wallet: { user: { address: walletAddress } }, openWallet } = this.props;
    if (!ssjs.isAddress(walletAddress)) return <Grid item xs={12}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AccountBalanceWalletOutlined />}
        size="large"
        onClick={openWallet}
        fullWidth
      >
        <Typography>Connect Wallet</Typography>
      </Button>
    </Grid>
    // Deposit
    const { address: accountAddress } = accountData || {}
    const isLP = ssjs.isAddress(accountAddress);
    let render = [<Grid item xs={isLP ? 6 : 12} key="deposit">
      <Button
        variant="contained"
        color="primary"
        startIcon={<InputRounded />}
        size="large"
        onClick={this.onOpenDeposit}
        fullWidth
      >
        <Typography>Deposit</Typography>
      </Button>
      <AddLiquidity poolData={data} visible={visibleDeposit} onClose={this.onCloseDeposit} />
    </Grid>]
    // Withdraw
    if (isLP) render.push(<Grid item xs={6} key="withdraw">
      <Button
        variant="outlined"
        startIcon={<OpenInNewRounded />}
        size="large"
        onClick={this.onOpenWithdraw}
        fullWidth
      >
        <Typography>Withdraw</Typography>
      </Button>
      <RemoveLiquidity accountData={accountData} visible={visibleWithdraw} onClose={this.onCloseWithdraw} />
    </Grid>)
    // Result
    return render;
  }

  render() {
    const { classes } = this.props;
    // Pool data
    const { data } = this.state;
    const { address: poolAddress, state, accountData, mint_s, mint_a, mint_b } = data;
    if (!ssjs.isAddress(poolAddress) || state !== 1) return null;
    // Extract mints
    const { amount } = accountData || {}
    const { icon: iconS, symbol: symbolS, decimals } = mint_s || {}
    const { icon: iconA, symbol: symbolA } = mint_a || {}
    const { icon: iconB, symbol: symbolB } = mint_b || {}
    // Combine data
    const icons = [iconA, iconB, iconS];
    const symbols = [symbolA, symbolB, symbolS];
    const tvl = data.usd;
    const roi = 0;
    const stake = utils.prettyNumber(ssjs.undecimalize(amount, decimals));

    return <Card className={classes.card}>
      <BucketWatcher addresses={[poolAddress]} onChange={this.fetchData} />
      <CardContent className={classes.cardContent}>
        <Grid container>
          <Grid item xs={12}>
            <Grid container className={classes.noWrap} alignItems="center">
              <Grid item className={classes.stretch}>
                <AvatarGroup max={3}>
                  {icons.map((icon, i) => <Avatar key={i} size="small" src={icon} />)}
                </AvatarGroup>
              </Grid>
              <Grid item>
                <Tooltip title="Quick Swap">
                  <IconButton to={`/swap/${poolAddress}`} component={RouterLink} edge="end">
                    <OfflineBoltRounded />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">{symbols.join(' x ')} Pool</Typography>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2">TVL</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h4">${numeral(tvl).format('0.0[00]a')} </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent className={classes.cardInfo}>
        <Grid container spacing={1}>
          {roi ? <Fragment>
            <Grid item xs={6}>
              <Typography variant="body2">ROI:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align="right" variant="body2"><strong>{roi}%</strong></Typography>
            </Grid>
          </Fragment> : null}
          <Grid item xs={6}>
            <Typography variant="body2">Your stake:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography align="right" variant="body2"><strong>{stake || 0}</strong></Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardContent className={classes.cardAction}>
        <Grid container>
          {this.onAction()}
        </Grid>
      </CardContent>
    </Card>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData, getPoolData,
  openWallet,
}, dispatch);

PoolCard.propTypes = {
  poolAddress: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PoolCard)));