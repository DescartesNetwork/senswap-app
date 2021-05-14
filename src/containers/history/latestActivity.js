import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import List from 'senswap-ui/list';

import EventItem from './eventItem';

import styles from './styles';
import { findAllTransactionByTime } from 'helpers/report';
import { setError } from 'modules/ui.reducer';


class LatestActivity extends Component {
  constructor() {
    super();

    this.state = {
      data: []
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
    const { wallet: { user: { address } }, setError } = this.props;
    const timeTo = Math.ceil(Number(new Date()) / 1000);
    const timeFrom = timeTo - 24 * 3600;
    return findAllTransactionByTime(address, timeFrom, timeTo).then(data => {
      return this.setState({ data })
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes, wallet: { user: { address } } } = this.props;
    const { data } = this.state;

    return <Grid container>
      <Grid item xs={12} >
        <List>
          <EventItem />
          <EventItem variant="swap" description="10000 SEN" />
          <EventItem variant="send" description="1.4917 SOL" />
          <EventItem variant="receive" />
          <EventItem variant="deposit" />
          <EventItem variant="withdraw" description="10 WETH" />
        </List>
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
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LatestActivity)));