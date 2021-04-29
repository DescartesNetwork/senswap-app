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

import { } from 'senswap-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';
import Price from './price';
import PriceChange from './priceChange';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Assets extends Component {
  constructor() {
    super();

    this.state = {
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: { accounts: prevAccounts } } = prevProps;
    const { wallet: { accounts } } = this.props;
    if (!isEqual(accounts, prevAccounts)) this.fetchData();
  }

  fetchData = (callback) => {
    const { wallet: { user: { address }, lamports, accounts }, getAccountData } = this.props;
    if (!accounts || !accounts.length) return;;

    return Promise.all(accounts.map(accountAddress => {
      return getAccountData(accountAddress);
    })).then(data => {
      // Add SOL also
      data.unshift({
        address,
        amount: parseFloat(ssjs.undecimalize(lamports, 9)),
        mint: {
          name: 'Solana',
          symbol: 'SOL',
          ticket: 'solana',
          icon: 'https://assets.coingecko.com/coins/images/4128/large/coinmarketcap-solana-200.png'
        }
      });
      return this.setState({ data }, callback);
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <Grid container>
      <Grid item xs={12}>
        <Typography variant="subtitle1">Asset Balances</Typography>
      </Grid>
      <Grid item xs={12}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>
                  <Typography variant="caption">ASSET</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">SYMBOL</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">24H MARKET</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">TOTAL BALANCE</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(accountData => {
                const { address, amount, mint: { ticket, icon, name, symbol } } = accountData;
                return <TableRow key={address}>
                  <TableCell >
                    <Favorite />
                  </TableCell>
                  <TableCell>
                    <Grid container className={classes.noWrap} alignItems="center">
                      <Grid item>
                        <MintAvatar icon={icon} />
                      </Grid>
                      <Grid item>
                        <Typography>{name}</Typography>
                      </Grid>
                    </Grid>
                  </TableCell>
                  <TableCell>
                    <Typography>{symbol}</Typography>
                  </TableCell>
                  <TableCell>
                    <PriceChange ticket={ticket} />
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
)(withStyles(styles)(Assets)));