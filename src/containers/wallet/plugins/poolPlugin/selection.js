import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import numeral from 'numeral';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';
import CircularProgress from 'senswap-ui/circularProgress';

import { CloseRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar, MintSelection, PoolAvatar } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMintData, getPoolData } from 'modules/bucket.reducer';


class Selection extends Component {
  constructor() {
    super();

    this.state = {
      visibleMintSelection: false,
      loading: false,
      mintData: {},
      data: [],
    }
  }

  componentDidMount() {
    const { mintData } = this.props;
    this.onMintData(mintData);
  }

  componentDidUpdate(prevProps) {
    const { mintData: prevMintData, visible: prevVisible } = prevProps;
    const { mintData, visible } = this.props;
    if (!isEqual(prevVisible, visible) && visible) this.onMintData(mintData);
    if (!isEqual(prevMintData, mintData)) this.onMintData({ mintData });
  }

  fetchData = async (condition) => {
    const { setError, getPools, getPoolData } = this.props;
    if (!condition) return;
    this.setState({ loading: true });
    let data = [];
    try {
      const pools = await getPools(condition, -1, 0);
      for (const { address: poolAddress } of pools) {
        try {
          let poolData = await getPoolData(poolAddress);
          const stat = await this.fetchPoolStat(poolData);
          poolData = { ...poolData, ...stat }
          data.push(poolData);
        } catch (er) { /* Nothing */ }
      }
      return this.setState({ data, loading: false });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  fetchPoolStat = async (poolData) => {
    const stat = { tvl: 0, roi: 0 }
    const { address: poolAddress, mint_a, mint_b, mint_s, reserve_a, reserve_b, reserve_s } = poolData;
    if (!ssjs.isAddress(poolAddress)) return stat;
    const { ticket: ticketA, decimals: decimalsA } = mint_a || {};
    const { ticket: ticketB, decimals: decimalsB } = mint_b || {};
    const { ticket: ticketS, decimals: decimalsS } = mint_s || {};
    const reserveA = ssjs.undecimalize(reserve_a, decimalsA);
    const reserveB = ssjs.undecimalize(reserve_b, decimalsB);
    const reserveS = ssjs.undecimalize(reserve_s, decimalsS);
    const tickets = [ticketA, ticketB, ticketS];
    const reserves = [reserveA, reserveB, reserveS];
    const prices = await Promise.all(tickets.map(ticket => ssjs.parseCGK(ticket)));
    stat.tvl = prices.reduce((sum, { price }, index) => sum + price * reserves[index], 0);
    return stat;
  }

  openMintSelection = () => this.setState({ visibleMintSelection: true });
  closeMintSelection = () => this.setState({ visibleMintSelection: false });

  onMintData = async (mintData) => {
    const { visible } = this.props;
    this.closeMintSelection();
    this.setState({ mintData });
    const { address: mintAddress } = mintData || {};
    if (!ssjs.isAddress(mintAddress)) return this.setState({ data: [] });
    const condition = { '$or': [{ mintS: mintAddress }, { mintA: mintAddress }, { mintB: mintAddress }] }
    if (!visible) return;
    return this.fetchData(condition);
  }

  onSelect = (poolAddress) => {
    const { onChange } = this.props;
    const { mintData, data } = this.state;
    const [poolData] = data.filter(({ address }) => address === poolAddress);
    return onChange({ mintData, poolData });
  }

  sortPools = () => {
    const { poolData } = this.props;
    const { data } = this.state;
    const { address: poolAddress } = poolData || {}
    const poolAddresses = []
    if (ssjs.isAddress(poolAddress)) poolAddresses.push(poolAddress);
    const recommendedPools = data.filter(({ address }) => poolAddresses.includes(address));
    const otherPools = data.filter(({ address }) => !poolAddresses.includes(address));
    return { recommendedPools, otherPools }
  }

  renderPools = (data) => {
    const { classes } = this.props;
    return data.map(poolData => {
      const { address, mint_a, mint_b, mint_s, roi, tvl } = poolData;
      if (!ssjs.isAddress(address)) return null;
      const { icon: iconA, symbol: symbolA } = mint_a || {};
      const { icon: iconB, symbol: symbolB } = mint_b || {};
      const { icon: iconS, symbol: symbolS } = mint_s || {};
      const icons = [iconA, iconB, iconS];
      return <TableRow key={address} className={classes.tableRow} onClick={() => this.onSelect(address)}>
        <TableCell >
          <Grid container className={classes.noWrap} alignItems="center">
            <Grid item>
              <PoolAvatar icons={icons} />
            </Grid>
            <Grid item>
              <Typography>{`${symbolA} x ${symbolB} x ${symbolS}`}</Typography>
            </Grid>
          </Grid>
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="textSecondary">ROI</Typography>
          <Typography>{roi}%</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="textSecondary">TVL</Typography>
          <Typography>${numeral(tvl).format('0.0[0]a')}</Typography>
        </TableCell>
      </TableRow>
    });
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, visibleMintSelection, mintData, data } = this.state;

    const { icon, name, symbol } = mintData || {}
    const { recommendedPools, otherPools } = this.sortPools();

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="h6"><strong>Pool List</strong></Typography>
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
              placeholder="Select Token"
              value={name || 'Select Token'}
              onClick={this.openMintSelection}
              InputProps={{
                startAdornment: loading ? <CircularProgress size={17} /> : <MintAvatar icon={icon} />,
                endAdornment: <IconButton size="small" onClick={this.openMintSelection}>
                  <ArrowDropDownRounded />
                </IconButton>,
              }}
              readOnly
              fullWidth
            />
            <MintSelection
              onChange={this.onMintData}
              visible={visibleMintSelection}
              onClose={this.closeMintSelection}
            />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell >
                      <Typography variant="caption">{!data.length ? 'No pool' : `${symbol} appears in ${data.length} pool(s)`}</Typography>
                    </TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                  {this.renderPools(recommendedPools)}
                  {this.renderPools(otherPools)}
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
  pool: state.pool,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPools, getPool,
  getMintData, getPoolData,
}, dispatch);

Selection.defaultProps = {
  mintData: {},
  poolData: {},
  visible: false,
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  mintData: PropTypes.object,
  poolData: PropTypes.object,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));