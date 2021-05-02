import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';

import { CloseRounded, SearchRounded } from 'senswap-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';

class Selection extends Component {
  constructor() {
    super();

    this.state = {
      search: '',
      data: [],
      searchedData: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { wallet: prevWallet } = prevProps;
    const { wallet } = this.props;
    if (!isEqual(prevWallet, wallet)) this.fetchData();
  }

  fetchData = (callback) => {
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

    if (!accounts || !accounts.length) return this.setState({ data: [solAccount], searchedData: [solAccount] });
    return Promise.all(accounts.map(accountAddress => {
      return getAccountData(accountAddress);
    })).then(data => {
      // Add SOL also
      data.unshift(solAccount);
      return this.setState({ data, searchedData: data }, callback);
    }).catch(er => {
      return setError(er);
    });
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    const { data } = this.state;
    if (!search) return this.setState({ search, searchedData: data });
    const pattern = new RegExp(search, 'gi');
    const searchedData = data.filter(({ mint: { name, symbol } }) => (pattern.test(name) || pattern.test(symbol)));
    return this.setState({ search, searchedData });
  }

  onChange = (expectedAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    const [accountData] = data.filter(({ address }) => expectedAddress === address);
    return onChange(accountData);
  }

  onClose = () => {
    const { onChange, onClose } = this.props;
    onChange({});
    return onClose();
  }

  render() {
    const { classes } = this.props;
    const { visible } = this.props;
    const { search, searchedData } = this.state;

    return <Dialog open={visible} onClose={this.onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6"><strong>Search</strong></Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={this.onClose} edge="end">
              <CloseRounded />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              placeholder="Search token"
              value={search}
              onChange={this.onSearch}
              InputProps={{
                startAdornment: <IconButton size="small">
                  <SearchRounded />
                </IconButton>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  {!searchedData.length ? <TableRow>
                    <TableCell >
                      <Typography variant="caption">No token</Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow> : null}
                  {searchedData.map(accountData => {
                    const { address, amount, mint: { icon, name, symbol, decimals } } = accountData;
                    return <TableRow key={address} className={classes.tableRow} onClick={() => this.onChange(address)}>
                      <TableCell >
                        <Grid container className={classes.noWrap} alignItems="center">
                          <Grid item>
                            <MintAvatar icon={icon} />
                          </Grid>
                          <Grid item>
                            <Typography>{name}</Typography>
                          </Grid>
                          <Grid item>
                            <Typography color="textSecondary">{symbol}</Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <Typography>{ssjs.undecimalize(amount, decimals)}</Typography>
                      </TableCell>
                    </TableRow>
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
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

Selection.defaultProps = {
  visible: false,
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));