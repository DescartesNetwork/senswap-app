import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import Table, { TableBody, TableCell, TableContainer, TableHead, TableRow } from 'senswap-ui/table';
import Favorite from 'senswap-ui/favorite';

import { AddRounded } from 'senswap-ui/icons';

import { MintSelection } from 'containers/wallet';
import { MintAvatar } from 'containers/wallet';
import Price from './price';
import PriceChange from './priceChange';
import CreateAccount from './createAccount';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Assets extends Component {
  constructor() {
    super();

    this.state = {
      visibleMintSelection: false,
      mintData: {},
      visibleCreateAccount: false,
      data: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet, bucket: prevBucket } = prevProps;
    const { wallet, bucket } = this.props;
    if (!isEqual(prevWallet, wallet)) return this.fetchData();
    if (!isEqual(prevBucket, bucket)) return this.fetchData();
  }

  fetchData = () => {
    const { wallet: { user: { address }, lamports, accounts }, getAccountData } = this.props;

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
    return Promise.all(accounts.map(accountAddress => {
      return getAccountData(accountAddress);
    })).then(data => {
      // Add SOL also
      data.unshift(solAccount);
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  onOpenMintSelection = () => this.setState({ visibleMintSelection: true });
  onCloseMintSelection = () => this.setState({ visibleMintSelection: false });
  onMintData = (mintData) => {
    return this.setState({ mintData }, () => {
      this.onOpenCreateAccount();
      return this.onCloseMintSelection();
    });
  }

  onOpenCreateAccount = () => this.setState({ visibleCreateAccount: true });
  onCloseCreateAccount = () => this.setState({ visibleCreateAccount: false });


  render() {
    const { classes } = this.props;
    const { visibleCreateAccount, mintData, visibleMintSelection, data } = this.state;

    return <Grid container spacing={1}>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1">Asset Balances</Typography>
          </Grid>
          <Grid item>
            <IconButton color="primary" onClick={this.onOpenMintSelection}>
              <AddRounded />
            </IconButton>
            <MintSelection
              visible={visibleMintSelection}
              onClose={this.onCloseMintSelection}
              onChange={this.onMintData}
            />
            <CreateAccount
              visible={visibleCreateAccount}
              onClose={this.onCloseCreateAccount}
              mintData={mintData}
            />
          </Grid>
        </Grid>
      </Grid>
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
                  <Typography variant="caption">No token</Typography>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell />
              </TableRow> : null}
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
                    <Typography>{ssjs.undecimalize(amount, 9)}</Typography>
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