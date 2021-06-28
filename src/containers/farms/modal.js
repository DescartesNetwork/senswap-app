import React, { Component, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import TextField from 'senswap-ui/textField';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getStakePools } from 'modules/stakePool.reducer';
import { getAccountData } from 'modules/bucket.reducer';

import { MintAvatar } from 'containers/wallet';
import AccountSelection from './newStakePool/selection';
import { CloseRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import configs from 'configs';
import sol from 'helpers/sol';

import styles from './styles';
class Modal extends Component {
  constructor() {
    super();

    this.state = {
      accountData: [{}],
      index: 0,
      visibleAccountSelection: false,
    }

    this.stakeRef = createRef();
    this.harvestRef = createRef();
  }

  handleStake = (type) => {
    const { onHandleStake } = this.props;
    const value = this.stakeRef.current.value;
    const { accountData: [{ mint: { address: mintAddress } }] } = this.state;

    if (!ssjs.isAddress(mintAddress)) return setError('Please select mint token');
    if (!value) return setError('Amuont is required');;
    onHandleStake(value, mintAddress, type);
  }
  handleHarvest = () => {
    const { onHandleHarvest } = this.props;
    const value = this.harvestRef.current.value;
    if (!value) return;
    onHandleHarvest(value);
  }
  onOpenAccountSelection = (index) => this.setState({ visibleAccountSelection: true });
  onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });

  onAccountData = (data) => {
    const { setError } = this.props;
    const { accountData, index } = this.state;
    if (accountData.some(({ address }) => data.address === address)) return setError('Already selected');
    let newAccountData = [...accountData];
    newAccountData[index] = data;
    return this.setState({ accountData: newAccountData }, () => {
      return this.onCloseAccountSelection();
    });
  }

  render() {
    const { visible, onClose, modalData: data, stakeLoading, unStakeLoading } = this.props;
    const { accountData, visibleAccountSelection } = this.state;
    console.log(data, 'modal data');

    return <Fragment>
      <Dialog open={visible} onClose={onClose}>
        <DialogTitle>Stat farming</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <Typography color="textSecondary">Stake pool</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Address: {data.address}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Total shares: {data && data.total_shares ? data.total_shares.toString() : 0}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">Annual Percentage</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">APR: {data.apr}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">APY: {data.apy}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Drain size={1} />
            </Grid>

            {/* Havest */}

            <Grid item xs={12}>
              <Typography color="textSecondary">Pending reward</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2">Reward: {data.pendingReward} SEN</Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField
                variant="contained"
                inputRef={this.harvestRef}
                InputProps={{
                  endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                    <strong>MAX</strong>
                  </Typography>
                }} />
            </Grid>
            <Grid item xs={4} align="end">
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleHarvest}
              >
                Harvest
            </Button>
            </Grid>
            <Grid item xs={12}>
              <Drain size={1} />
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">Farming</Typography>
            </Grid>

            {/* Stake + unStake */}
            <Grid item xs={4}>
              {accountData.map((data, index) => {
                const { mint } = data;
                const { symbol, icon } = mint || {};
                return <Fragment key={index}>
                  <Grid item xs={6}>
                    <Typography color="textPrimary">LP token: </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      size="small"
                      startIcon={<MintAvatar icon={icon} />}
                      endIcon={<ArrowDropDownRounded />}
                      onClick={() => this.onOpenAccountSelection(index)}
                    >
                      <Typography>{symbol || 'Select'} </Typography>
                    </Button>
                  </Grid>
                </Fragment>
              })}
            </Grid>
            <Grid item xs={4}>
              <TextField
                variant="contained"
                defaultValue="0"
                inputRef={this.stakeRef}
                InputProps={{
                  endAdornment: <Typography color="error" style={{ cursor: 'pointer' }}>
                    <strong>MAX</strong>
                  </Typography>
                }} />
            </Grid>
            <Grid item xs={4} align="end">
              {unStakeLoading ? <Button color="secondary">UnStake</Button> :
                <Button color="secondary" onClick={() => this.handleStake('unstake')}>UnStake</Button>}
              {stakeLoading ? <Button
                variant="contained"
                color="primary">Stake <CircularProgress size={16} /></Button> :
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.handleStake()}
                >
                  Stake
            </Button>}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <AccountSelection
        solana={false}
        visible={visibleAccountSelection}
        onClose={this.onCloseAccountSelection}
        onChange={this.onAccountData}
      />
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  getStakePools,
  getAccountData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Modal)));