import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';
import { PoolAvatar } from 'containers/pool';
import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';

import { CloseRounded, ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';
import AccountSelection from './selection';

import styles from './styles';
import configs from 'configs';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getMint, getMints } from 'modules/mint.reducer';
import { addStakePool } from 'modules/stakePool.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';
import ListLPT from './ListLPT';

import NewStakePoolContent from './components/Content';
import NewStakePoolHeader from './components/Header.js';
class NewStakePool extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      senToken: {},
      poolInfo: null,
      index: 0,
      visibleAccountSelection: false,
      reward: 0,
      period: 0,
    };

    this.swap = window.senswap.swap;
  }

  componentDidMount() {
    this.fetchSenTokenInfo();
  }

  fetchSenTokenInfo = async () => {
    const {
      sol: { senAddress },
    } = configs;
    const { getMint } = this.props;
    try {
      this.setState({ loading: true });
      //Fetch Sen Token Data
      let senToken = await getMint(senAddress);
      return this.setState({ loading: false, senToken });
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  };

  onCloseListLPT = () => this.setState({ visibleAccountSelection: false });

  onSelectLPT = (pool) => {
    return this.setState({ poolInfo: pool }, () => {
      return this.onCloseListLPT();
    });
  };

  onChange = (e) => {
    const { name, value } = e.target;
    const valueNumber = value.replace(/[^\d/.]/g, '');
    return this.setState({ [name]: valueNumber });
  };

  onChangePeriod = (e) => {
    const period = e.target.value || '';
    return this.setState({ period: period });
  };

  handleCreateStakePool = async () => {
    const liteFarming = new ssjs.LiteFarming(undefined, undefined, undefined, configs.sol.node);
    const wallet = window.senswap.wallet;
    const { setError, setSuccess, addStakePool, onClose } = this.props;
    const {
      senToken,
      poolInfo: { mint_lpt },
      period,
      reward,
    } = this.state;
    const decimal = mint_lpt.decimal;

    const reserveReward = ssjs.decimalize(reward, decimal);
    const reservePeriod = period;
    const ownerAddress = await wallet.getAccount();
    const srcAAddress = mint_lpt.address;
    const srcSAddress = senToken.address;

    try {
      this.setState({ loading: true });
      console.log(reserveReward, reservePeriod, ownerAddress, srcAAddress, srcSAddress);
      const data = await liteFarming.initializeStakePool(
        reserveReward,
        reservePeriod,
        ownerAddress,
        srcAAddress,
        srcSAddress,
        wallet,
      );
      const stakePool = {
        address: data.stakePoolAddress,
        mintShare: data.mintShareAddress,
      };
      await addStakePool(stakePool);
      await setSuccess('Create a new pool successfully');
      return this.setState({ loading: false }, onClose);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  };

  checkCreatePool() {
    const { poolInfo, reward, period } = this.state;
    return poolInfo && Number(reward) && Number(period);
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { poolInfo, loading, reward, period, senToken, visibleAccountSelection } = this.state;

    //LPT info
    let poolIcon = [];
    let lptName = '- Select one -';
    if (poolInfo) {
      const {
        mint_s: { icon: iconS, symbol: symbolS },
        mint_a: { icon: iconA, symbol: symbolA },
        mint_b: { icon: iconB, symbol: symbolB },
      } = poolInfo;
      poolIcon = [iconA, iconB, iconS];
      lptName = `${symbolA || '.'} x ${symbolB || '.'} x ${symbolS || '.'}`;
    }

    return (
      <Dialog open={visible} onClose={onClose} fullWidth>
        {/* Header */}
        <NewStakePoolHeader></NewStakePoolHeader>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Description */}
            <NewStakePoolContent></NewStakePoolContent>

            {/* Reward Token */}
            <Grid container item xs={12} alignItems="center">
              <Grid item xs={3}>
                <Typography color="textPrimary"> Reward Token: </Typography>
              </Grid>
              <Button
                size="small"
                startIcon={<MintAvatar icon={senToken.icon} />}
                endIcon={<ArrowDropDownRounded />}
                disabled={true}
              >
                <Typography>{senToken.symbol} </Typography>
              </Button>
            </Grid>

            {/* LP Token */}
            <Grid container item xs={12} alignItems="center">
              <Grid item xs={3}>
                <Typography color="textPrimary"> LP Token: </Typography>
              </Grid>
              <Button
                size="small"
                startIcon={poolInfo ? <PoolAvatar icons={poolIcon} /> : <MintAvatar />}
                endIcon={<ArrowDropDownRounded />}
                onClick={() => this.setState({ visibleAccountSelection: true })}
              >
                <Typography>{lptName} </Typography>
              </Button>
            </Grid>

            {/* New Stake Pool Stat */}
            <Grid item xs={6}>
              <TextField
                name="reward"
                label="Reward"
                variant="contained"
                value={reward}
                onChange={(e) => this.onChange(e)}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                name="period"
                label="Period"
                value={period}
                variant="contained"
                onChange={(e) => this.onChange(e)}
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            </Grid>

            {/* Action */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={this.handleCreateStakePool}
                endIcon={loading ? <CircularProgress size={17} /> : null}
                disabled={loading || !this.checkCreatePool()}
                fullWidth
              >
                <Typography>Create Stake Pool</Typography>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Modal Select LPT */}
        <ListLPT
          solana={false}
          visible={visibleAccountSelection}
          onClose={this.onCloseListLPT}
          onSelect={this.onSelectLPT}
        />
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  ui: state.ui,
  pool: state.pool,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setError,
      setSuccess,
      getMints,
      addStakePool,
      updateWallet,
      getAccountData,
      getMint,
    },
    dispatch,
  );

NewStakePool.defaultProps = {
  visible: false,
  onClose: () => {},
};

NewStakePool.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NewStakePool)));
