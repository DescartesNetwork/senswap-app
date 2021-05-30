import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import numeral from 'numeral';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';
import CircularProgress from 'senswap-ui/circularProgress';

import { CloseRounded, SearchRounded } from 'senswap-ui/icons';

import { MintAvatar, WSOL, BucketWatcher } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { getMints, getMint } from 'modules/mint.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class Selection extends Component {
  constructor() {
    super();

    this.state = {
      visibleWSOL: false,
      loading: false,
      search: '',
      data: [],
    }
  }

  componentDidMount() {
    const { visible, condition } = this.props;
    if (visible) this.fetchData(condition);
  }

  componentDidUpdate(prevProps) {
    const {
      visible: prevVisible, condition: prevCondition,
      wallet: { accounts: prevAccounts }
    } = prevProps;
    const { visible, condition, wallet: { accounts } } = this.props;
    if (!isEqual(prevVisible, visible) && visible) this.fetchData(condition);
    if (!isEqual(prevCondition, condition) && visible) this.fetchData(condition);
    if (!isEqual(prevAccounts, accounts) && visible) this.fetchData(condition);
  }

  fetchData = async (condition = {}, limit = 5) => {
    const {
      setError, getMints, getMint, getAccountData,
      wallet: { user: { address: walletAddress } }
    } = this.props;
    this.setState({ loading: true });
    try {
      let mints = await getMints(condition, limit, 0);
      mints = await Promise.all(mints.map(({ address }) => getMint(address)));
      let data = [];
      for (const mintData of mints) {
        try {
          const { address: mintAddress } = mintData;
          if (!ssjs.isAddress(mintAddress)) throw new Error('Invalid mint address');
          if (!ssjs.isAddress(walletAddress)) throw new Error('Invalid wallet address');
          const { address: accountAddress, state } = await sol.scanAccount(mintAddress, walletAddress);
          if (!state) throw new Error('Invalid state');
          const accountData = await getAccountData(accountAddress);
          data.push(accountData);
        } catch (er) {
          data.push({ address: '', amount: global.BigInt(0), mint: mintData });
        }
      }
      return this.setState({ data, loading: false });
    } catch (er) {
      return setError(er);
    }
  }

  onSearch = (e) => {
    const search = e.target.value || '';
    const condition = !search ? {} : {
      '$or': [
        { symbol: { '$regex': search, '$options': 'gi' } },
        { name: { '$regex': search, '$options': 'gi' } }
      ]
    }
    const limit = !search ? 5 : 1;
    return this.setState({ search }, () => {
      return this.fetchData(condition, limit);
    });
  }

  onChange = (mintAddress) => {
    const { onChange } = this.props;
    const { data } = this.state;
    const mints = data.map(({ mint }) => mint);
    const [mintData] = mints.filter(({ address }) => mintAddress === address);
    return onChange(mintData);
  }

  onWSOL = (e) => {
    e.stopPropagation();
    const { visibleWSOL } = this.state;
    return this.setState({ visibleWSOL: !visibleWSOL });
  }

  render() {
    const { classes, condition, visible, onClose } = this.props;
    const { loading, search, data, visibleWSOL } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <BucketWatcher
        addresses={data.filter(({ address }) => ssjs.isAddress(address)).map(({ address }) => address)}
        onChange={search ? () => this.onSearch({ target: { value: search } }) : () => this.fetchData(condition)}
      />
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6"><strong>Token List</strong></Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={onClose} edge="end">
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
                  {loading ? <CircularProgress size={17} /> : <SearchRounded />}
                </IconButton>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  {!data.length ? <TableRow>
                    <TableCell>
                      <Typography variant="caption">No token</Typography>
                    </TableCell>
                  </TableRow> : null}
                  {data.map((accountData, index) => {
                    const { amount, mint } = accountData || {};
                    const { address: mintAddress, icon, name, symbol, decimals } = mint || {};
                    const balance = ssjs.undecimalize(amount, decimals);
                    return <Fragment key={index}>
                      <TableRow className={classes.tableRow} onClick={() => this.onChange(mintAddress)}>
                        <TableCell>
                          <Grid container className={classes.noWrap} alignItems="center">
                            <Grid item>
                              <MintAvatar icon={icon} />
                            </Grid>
                            <Grid item>
                              <Typography>{name}</Typography>
                              <Typography variant="caption" color="textSecondary">Your Balance: {numeral(balance).format('0,0.[000000]')} {symbol}</Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                        {ssjs.DEFAULT_WSOL === mintAddress ? <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={this.onWSOL}
                          >
                            <Typography>Wrap/Unwrap SOL</Typography>
                          </Button>
                        </TableCell> : <TableCell />}
                      </TableRow>
                      {ssjs.DEFAULT_WSOL === mintAddress && visibleWSOL ? <TableRow>
                        <TableCell colSpan={2}>
                          <WSOL />
                        </TableCell>
                      </TableRow> : null}
                    </Fragment>
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
  mint: state.mint,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getMints, getMint,
  getAccountData,
}, dispatch);

Selection.defaultProps = {
  visible: false,
  condition: {},
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  visible: PropTypes.bool,
  condition: PropTypes.object,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));