import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Drawer from 'senswap-ui/drawer';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import List from 'senswap-ui/list';

import { ArrowForwardIosRounded } from 'senswap-ui/icons';

import { CardBalance } from 'components/card';
import EventItem from './eventItem';

import styles from './styles';
import { toggleRightBar } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class History extends Component {
  constructor() {
    super();

    this.state = {
      accountData: []
    }
  }

  componentDidMount() {
    const { ui: { rightbar } } = this.props;
    if (rightbar) this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts }, ui: { rightbar: prevRightbar } } = prevProps;
    const { wallet: { accounts }, ui: { rightbar } } = this.props;
    if (!isEqual(prevAccounts, accounts) && rightbar) return this.fetchData();
    if (!isEqual(prevRightbar, rightbar) && rightbar) return this.fetchData();
  }

  fetchData = () => {
    const { wallet: { accounts, lamports }, serError, getAccountData } = this.props;

    const solAccount = {
      amount: global.BigInt(lamports),
      mint: { decimals: 9, ticket: 'solana' }
    }

    return accounts.each(accountAddress => {
      return getAccountData(accountAddress);
    }, { skipError: true, skipIndex: true }).then(data => {
      let accountData = data.filter(({ pool }) => {
        const { address: poolAddress } = pool || {}
        return !ssjs.isAddress(poolAddress);
      });
      accountData.unshift(solAccount);
      return this.setState({ accountData });
    }).catch(er => {
      return serError(er);
    });
  }

  render() {
    const { classes, ui: { rightbar }, wallet: { user: { address } }, toggleRightBar } = this.props;
    const { accountData } = this.state;

    return <Drawer
      open={rightbar}
      anchor="right"
      variant="temporary"
      onClose={toggleRightBar}
      className={classes.drawer}
      classes={{ paper: classes.paper }}
    >
      <Grid container>
        {/* Safe space */}
        <Grid item xs={12} >
          <IconButton size="small" onClick={toggleRightBar} edge="start">
            <ArrowForwardIosRounded />
          </IconButton>
        </Grid>
        {/* Overall */}
        <Grid item xs={12}>
          <CardBalance accountData={accountData} address={address} />
        </Grid>
        <Grid item xs={12}>
          <Drain size={2} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Latest Activities</Typography>
        </Grid>
        <Grid item xs={12}>
          <List>
            <EventItem />
            <EventItem variant="swap" description="10000 SEN" />
            <EventItem variant="send" description="1.4917 SOL" />
            <EventItem variant="receive" />
            <EventItem variant="deposit" />
            <EventItem variant="withdraw" description="10 WETH" />
          </List>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth>
            <Typography>See more</Typography>
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Drain size={4} />
        </Grid>
      </Grid>
    </Drawer>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  toggleRightBar,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(History)));