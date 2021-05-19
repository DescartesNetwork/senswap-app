import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Favorite from 'senswap-ui/favorite';
import CircularProgress from 'senswap-ui/circularProgress';
import Pagination from 'senswap-ui/pagination';

import { MintAvatar } from 'containers/wallet';
import Price from './price';
import PriceChange from './priceChange';

import styles from './styles';
import utils from 'helpers/utils';
import Personalization from 'helpers/personalization';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Accounts extends Component {
  constructor() {
    super();

    this.state = {
      limit: 5,
      page: 0,
      loading: false,
      data: [],
      fav: [],
    }
  }

  componentDidMount() {
    this.fetchFavourite();
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    const { wallet: { accounts: prevAccount, user: { address: prevAddress } } } = prevProps;
    const { page: prevPage } = prevState;
    const { wallet: { accounts, user: { address } } } = this.props;
    const { page } = this.state;
    if (!isEqual(prevAddress, address)) this.fetchFavourite();
    if (!isEqual(prevPage, page)) this.fetchData();
    if (!isEqual(prevAccount, accounts)) {
      this.fetchData();
      this.fetchFavourite();
    }
  }

  fetchData = async () => {
    const { wallet: { user: { address }, lamports, accounts }, getAccountData } = this.props;
    const { limit, page } = this.state;

    const solAccount = {
      address,
      amount: global.BigInt(lamports),
      mint: {
        decimals: 9,
        name: 'Solana',
        symbol: 'SOL',
        ticket: 'solana',
        icon: 'https://assets.coingecko.com/coins/images/4128/large/coinmarketcap-solana-200.png'
      }
    }

    if (!accounts || !accounts.length) return this.setState({ data: [solAccount] });
    this.setState({ data: [], loading: true });
    let data = [];
    const sortedAccounts = this.sortFavourite(accounts);
    const inPageAccounts = sortedAccounts.slice(page * limit, (page + 1) * limit);
    for (const accountAddress of inPageAccounts) {
      try {
        const accountData = await getAccountData(accountAddress);
        const { pool } = accountData;
        const { address: poolAddress } = pool || {}
        if (!ssjs.isAddress(poolAddress)) data.push(accountData);
      } catch (er) { /* Skip error */ }
    }
    data.unshift(solAccount);
    return this.setState({ data, loading: false });
  }

  fetchFavourite = () => {
    const { wallet: { user: { address } } } = this.props;
    this.personalization = new Personalization(address);
    return this.setState({ fav: this.personalization.getFavoriteAccounts() });
  }

  onFavourite = (address, checked) => {
    if (checked) this.personalization.addFavoriteAccount(address);
    else this.personalization.removeFavoriteAccount(address);
    const fav = this.personalization.getFavoriteAccounts();
    return this.setState({ fav });
  }

  sortFavourite = (accounts) => {
    const { wallet: { user: { address } } } = this.props;
    this.personalization = new Personalization(address);
    const fav = this.personalization.getFavoriteAccounts();
    const favAddresses = accounts.filter(address => fav.includes(address));
    const otherAddresses = accounts.filter(address => !favAddresses.includes(address));
    const sortedAccounts = favAddresses.concat(otherAddresses);
    return sortedAccounts;
  }

  onPagination = (page) => {
    return this.setState({ page });
  }

  toExplorer = (accountAddress) => {
    return window.open(utils.explorer(accountAddress));
  }

  render() {
    const { classes, wallet: { accounts } } = this.props;
    const { loading, data, fav, page, limit } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="caption" color="textSecondary">ASSET</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">SYMBOL</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">24H MARKET</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">AMOUNT</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="textSecondary">TOTAL BALANCE</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!data.length ? <TableRow>
                <TableCell />
                <TableCell >
                  {loading ? <CircularProgress size={17} /> : <Typography variant="caption">No token</Typography>}
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow> : null}
              {data.map((accountData, index) => {
                const {
                  address, amount,
                  mint: { address: mintAddress, ticket, icon, name, symbol }
                } = accountData;
                return <TableRow key={address}>
                  <TableCell >
                    <Favorite
                      checked={fav.includes(address) || !index}
                      onChange={(value) => this.onFavourite(address, value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Grid container className={classes.noWrap} alignItems="center">
                      <Grid item>
                        <MintAvatar title={'View on explorer'} icon={icon} onClick={() => this.toExplorer(address)} />
                      </Grid>
                      <Grid item>
                        <Typography>{name || mintAddress.substring(0, 6) + '...'}</Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    <Typography>{symbol || 'UNKNOWN'}</Typography>
                  </TableCell>
                  <TableCell>
                    <PriceChange ticket={ticket} />
                  </TableCell>
                  <TableCell>
                    <Typography>{utils.prettyNumber(ssjs.undecimalize(amount, 9))}</Typography>
                  </TableCell>
                  <TableCell>
                    <Price amount={parseFloat(ssjs.undecimalize(amount, 9))} ticket={ticket} />
                  </TableCell>
                </TableRow>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item xs={12}>
        <Pagination
          page={page}
          onChange={this.onPagination}
          count={Math.ceil(accounts.length / limit)}
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Accounts)));