import React, { Component } from 'react';
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
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';

import { InputRounded, LaunchRounded } from 'senswap-ui/icons';

import AddLiquidity from 'containers/pool/addLiquidity';
import RemoveLiquidity from 'containers/pool/removeLiquidity';
import { BucketWatcher } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import { getAccountData } from 'modules/bucket.reducer';


class LPT extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      data: {},
      visibleDeposit: false,
      visibleWithdraw: false,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { poolData: prevPoolData, wallet: { lpts: prevLPTs } } = prevProps;
    const { poolData, wallet: { lpts } } = this.props;
    if (!isEqual(prevPoolData, poolData)) this.fetchData();
    if (!isEqual(prevLPTs, lpts)) this.fetchData();
  }

  fetchData = async () => {
    const {
      poolData, wallet: { user: { address: walletAddress } },
      getAccountData,
    } = this.props;
    const { mint_lpt } = poolData;
    const { address: mintAddress } = mint_lpt || {};
    if (!ssjs.isAddress(mintAddress) || !ssjs.isAddress(walletAddress)) return this.setState({ data: {} });

    this.setState({ loading: true });
    try {
      const { address: accountAddress, state } = await sol.scanAccount(mintAddress, walletAddress);
      if (!state) throw new Error('Invalid state');
      const data = await getAccountData(accountAddress);
      return this.setState({ loading: false, data });
    } catch (er) {
      return this.setState({ loading: false, data: {} });
    }
  }

  onOpenDeposit = () => this.setState({ visibleDeposit: true });
  onCloseDeposit = () => this.setState({ visibleDeposit: false });

  onOpenWithdraw = () => this.setState({ visibleWithdraw: true });
  onCloseWithdraw = () => this.setState({ visibleWithdraw: false });

  render() {
    const { classes, poolData } = this.props;
    const { visibleDeposit, visibleWithdraw, data, loading } = this.state;
    const { address: lptAddress, amount, mint } = data || {};
    const { supply, decimals } = mint || {};
    const lpt = ssjs.undecimalize(amount, decimals);
    const total = ssjs.undecimalize(supply, decimals);
    const portion = total ? lpt / total * 100 : 0;

    return <Paper className={classes.paper}>
      <BucketWatcher addresses={[lptAddress]} onChange={this.fetchData} />
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="subtitle1" color="textSecondary">Liquidity Provision</Typography>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Your LP Token</Typography>
        </Grid>
        <Grid item xs={12}>
          {loading ? <CircularProgress size={17} /> :
            <Typography variant="h3">{numeral(lpt).format('0,0.[0000]')} <span style={{ fontSize: 20 }}>LPT</span></Typography>}
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">Your Portion</Typography>
        </Grid>
        <Grid item xs={12}>
          {loading ? <CircularProgress size={17} /> :
            <Typography variant="h3">{numeral(portion).format('0.[0000]')}% <span className={classes.unit}>(Over {numeral(total).format('0.[00]a')} LPT)</span></Typography>}
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<InputRounded />}
            size="large"
            onClick={this.onOpenDeposit}
            fullWidth
          >
            <Typography>Deposit</Typography>
          </Button>
          <AddLiquidity poolData={poolData} visible={visibleDeposit} onClose={this.onCloseDeposit} />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="outlined"
            startIcon={<LaunchRounded />}
            size="large"
            onClick={this.onOpenWithdraw}
            fullWidth
          >
            <Typography>Withdraw</Typography>
          </Button>
          <RemoveLiquidity accountData={data} visible={visibleWithdraw} onClose={this.onCloseWithdraw} />
        </Grid>
      </Grid>
    </Paper>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getAccountData,
}, dispatch);

LPT.defaultProps = {
  poolData: {},
}

LPT.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LPT)));