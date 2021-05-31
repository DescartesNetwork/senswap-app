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
import Button, { IconButton } from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Dialog, { DialogTitle, DialogContent, DialogActions } from 'senswap-ui/dialog';
import Table, { TableBody, TableCell, TableContainer, TableRow } from 'senswap-ui/table';
import CircularProgress from 'senswap-ui/circularProgress';
import Drain from 'senswap-ui/drain';

import {
  CloseRounded, ArrowDropDownRounded, CheckCircleOutlineRounded,
} from 'senswap-ui/icons';

import { MintAvatar, MintSelection, PoolAvatar } from 'containers/wallet';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMintData, getPoolData } from 'modules/bucket.reducer';


class Selection extends Component {
  constructor() {
    super();

    this.state = {
      selectedPoolAddress: '',
      visibleMintSelection: false,
      loading: false,
      mintData: {},
      data: [],
    }
  }

  componentDidMount() {
    const { mintData, refPoolAddress } = this.props;
    this.onMintData(mintData);
    this.setState({ selectedPoolAddress: refPoolAddress });
  }

  componentDidUpdate(prevProps) {
    const {
      mintData: prevMintData,
      visible: prevVisible,
      refPoolAddress: prevRefPoolAddress
    } = prevProps;
    const { mintData, visible, refPoolAddress } = this.props;
    if (!isEqual(prevVisible, visible) && visible) this.onMintData(mintData);
    if (!isEqual(prevMintData, mintData)) this.onMintData({ mintData });
    if (!isEqual(prevRefPoolAddress, refPoolAddress)) this.setState({ selectedPoolAddress: refPoolAddress });
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
      return this.setState({ data, loading: false }, this.sortPools);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  fetchPoolStat = async (poolData) => {
    const stat = { tvl: 0, roi: 0 }
    const {
      address: poolAddress,
      mint_a, mint_b, mint_s,
      reserve_a, reserve_b, reserve_s
    } = poolData;
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

  sortPools = () => {
    const { refPoolAddress } = this.props;
    const { data, selectedPoolAddress } = this.state;
    const recommendedPools = data.filter(({ address }) => refPoolAddress === address);
    const otherPools = data
      .filter(({ address }) => refPoolAddress !== address)
      .sort(({ reserve_s: a }, { reserve_s: b }) => Number(b - a));
    const poolData = recommendedPools.concat(otherPools);
    const { address: poolAddress } = poolData[0] || {}
    return this.setState({
      selectedPoolAddress: selectedPoolAddress || poolAddress,
      data: poolData
    });
  }

  openMintSelection = () => this.setState({ visibleMintSelection: true });
  closeMintSelection = () => this.setState({ visibleMintSelection: false });

  onMintData = async (mintData) => {
    const { visible } = this.props;
    this.closeMintSelection();
    this.setState({ mintData });
    const { address: mintAddress } = mintData || {};
    if (!ssjs.isAddress(mintAddress)) return this.setState({ data: [] }, this.openMintSelection);
    const condition = { '$or': [{ mintS: mintAddress }, { mintA: mintAddress }, { mintB: mintAddress }] }
    if (!visible) return;
    return this.fetchData(condition);
  }

  onSelect = (poolAddress) => {
    return this.setState({ selectedPoolAddress: poolAddress });
  }

  onOk = () => {
    const { onChange } = this.props;
    const { mintData, data, selectedPoolAddress } = this.state;
    const [poolData] = data.filter(({ address }) => address === selectedPoolAddress);
    return onChange({ mintData, poolData });
  }

  renderPools = (data) => {
    const { classes } = this.props;
    const { selectedPoolAddress } = this.state;
    return data.map((poolData, index) => {
      const { address, mint_a, mint_b, mint_s, roi, tvl } = poolData;
      if (!ssjs.isAddress(address)) return null;
      const { icon: iconA, symbol: symbolA } = mint_a || {};
      const { icon: iconB, symbol: symbolB } = mint_b || {};
      const { icon: iconS, symbol: symbolS } = mint_s || {};
      const icons = [iconA, iconB, iconS];
      return <TableRow key={address} className={classes.tableRow} onClick={() => this.onSelect(address)}>
        <TableCell >
          <Grid container className={classes.noWrap} alignItems="center" spacing={1}>
            {selectedPoolAddress === address ? <Grid item>
              <IconButton size="small">
                <CheckCircleOutlineRounded
                  fontSize="small"
                  className={!index ? classes.recommended : classes.warning}
                />
              </IconButton>
            </Grid> : null}
            <Grid item>
              <PoolAvatar icons={icons} />
            </Grid>
            <Grid item>
              <Typography>{`${symbolA} x ${symbolB} x ${symbolS}`}</Typography>
              {!index ? <Typography variant="caption" className={classes.recommended}>Highly recommended pool</Typography> : null}
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
        <TableCell>
          <Typography variant="caption" color="textSecondary">Pool Address</Typography>
          <Typography>{address.substring(0, 3) + '...' + address.substring(address.length - 3, address.length)}</Typography>
        </TableCell>
      </TableRow>
    });
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, visibleMintSelection, mintData, data } = this.state;
    const { icon, name, symbol } = mintData || {}

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
        <Grid container>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              placeholder="Select Token"
              value={name || 'Select Token'}
              onClick={this.openMintSelection}
              InputProps={{
                startAdornment: <MintAvatar icon={icon} />,
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
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={4}>
                      {loading ? <CircularProgress size={17} /> :
                        <Typography variant="caption">{`${symbol} appears in ${data.length} pool(s). ${data.length ? 'Please select your pool to continue.' : ''}`}</Typography>}
                    </TableCell>
                  </TableRow>
                  {this.renderPools(data)}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        <Button
          variant="contained"
          color="primary"
          onClick={this.onOk}
          disabled={!data.length}
          fullWidth
        >
          <Typography>OK</Typography>
        </Button>
      </DialogActions>
    </Dialog >
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
  refPoolAddress: '',
  visible: false,
  onChange: () => { },
  onClose: () => { },
}

Selection.propTypes = {
  mintData: PropTypes.object,
  refPoolAddress: PropTypes.string,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Selection)));