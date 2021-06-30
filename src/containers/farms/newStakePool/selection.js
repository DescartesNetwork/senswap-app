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
import CircularProgress from 'senswap-ui/circularProgress';

import { CloseRounded, SearchRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import configs from 'configs';
import { setError } from 'modules/ui.reducer';
import { getAccountData, getPoolData } from 'modules/bucket.reducer';
import { getPools } from 'modules/pool.reducer';

class Selection extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      search: '',
      data: [],
      searchedData: [],
    }

    this.swap = window.senswap.swap;
  }

  componentDidUpdate(prevProps) {
    const { visible: prevVisible, wallet: prevWallet } = prevProps;
    const { visible, wallet } = this.props;
    if (!isEqual(prevVisible, visible) && visible) return this.fetchData();
    if (!isEqual(prevWallet, wallet) && visible) return this.fetchData();
  }

  fetchData = async () => {
    const {
      wallet: { user: { address }, lamports, accounts },
      solana, getAccountData, getPools, getPoolData
    } = this.props;
    const { sol: { native } } = configs;
    const pools = await getPools();
    
    const promises = pools.map(pool=> getPoolData(pool.address));
    const poolData = await Promise.all(promises);


    return this.setState({ data: poolData, searchedData: poolData, loading: false });
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
    const { searchedData } = this.state;
    const [accountData] = searchedData.filter(({ mint: { address } }) => expectedAddress === address);
    return onChange(accountData);
  }

  render() {
    const { classes } = this.props;
    const { visible, onClose } = this.props;
    const { loading, search, searchedData } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6"><strong>Search</strong></Typography>
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
                  {loading ? <TableRow>
                    <TableCell >
                      <CircularProgress size={17} />
                    </TableCell>
                    <TableCell />
                  </TableRow> : null}
                  {!searchedData.length && !loading ? <TableRow>
                    <TableCell >
                      <Typography variant="caption">No token</Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow> : null}
                  {!loading ? searchedData.map(accountData => {
                    const { amount, mint: { icon, name, symbol, decimals, address } } = accountData;
                    return <TableRow key={address} className={classes.tableRow} onClick={() => this.onChange(address)}>
                      <TableCell >
                        <Grid container className={classes.noWrap} alignItems="center">
                          <Grid item>
                            <MintAvatar icon={icon} />
                          </Grid>
                          <Grid item>
                            <Typography>{name || address.substring(0, 6) + '...'}</Typography>
                          </Grid>
                          <Grid item>
                            <Typography color="textSecondary">{symbol || 'UNKNOWN'}</Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <Typography>{utils.prettyNumber(ssjs.undecimalize(amount, decimals))}</Typography>
                      </TableCell>
                    </TableRow>
                  }) : null}
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
  getPools,
  getPoolData
}, dispatch);

Selection.defaultProps = {
  solana: true,
  visible: false,
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  solana: PropTypes.bool,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));