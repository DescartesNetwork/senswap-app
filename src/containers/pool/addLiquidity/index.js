import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import TextField from 'senswap-ui/textField';
import Button, { IconButton } from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Drain from 'senswap-ui/drain';
import Divider from 'senswap-ui/divider';


import { CloseRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet, unlockWallet, syncWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


const EMPTY = {
  loading: false,
  txId: '',
}

class AddLiquidity extends Component {
  constructor() {
    super();

    this.state = {
      ...EMPTY,

      accountData: [{}, {}, {}],
      index: 0,
      amounts: ['', '', ''],

      poolData: {},
      srcData: {},
      lptAddress: '',
      amount: 0,
    }

    this.swap = window.senswap.swap;
  }

  onAutogenLPTAddress = (poolAddress, secretKey) => {
    return new Promise((resolve, reject) => {
      if (!ssjs.isAddress(poolAddress)) return reject('Invalid pool address');
      if (!secretKey) return reject('Cannot unlock wallet');
      const {
        wallet: { user, lpts },
        updateWallet, syncWallet
      } = this.props;
      let { lptAddress } = this.state;
      if (lptAddress) return resolve(lptAddress);
      return sol.newLPT(poolAddress, secretKey).then(({ lpt }) => {
        const newPools = [...user.pools];
        if (!newPools.includes(poolAddress)) newPools.push(poolAddress);
        const newLPTs = [...lpts];
        const lptAddress = lpt.publicKey.toBase58();
        if (!newLPTs.includes(lptAddress)) newLPTs.push(lptAddress);
        return updateWallet({ user: { ...user, pools: newPools }, lpts: newLPTs });
      }).then(re => {
        return syncWallet(secretKey);
      }).then(re => {
        return resolve(lptAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  addLiquidity = () => {
    const { setError, unlockWallet } = this.props;
    const {
      amount, srcData: { address: srcAddress },
      poolData: { state, address: poolAddress, mint, treasury },
    } = this.state;
    const { decimals } = mint || {}
    const { address: treasuryAddress } = treasury || {}
    if (state !== 1) return setError('The pool is uninitilized or frozen');
    if (!amount || !parseFloat(amount)) return setError('Invalid amount');

    let secretKey = null;
    return this.setState({ loading: true }, () => {
      return unlockWallet().then(re => {
        secretKey = re;
        return this.onAutogenLPTAddress(poolAddress, secretKey);
      }).then(lptAddress => {
        const reserve = ssjs.decimalize(parseFloat(amount), decimals);
        const payer = ssjs.fromSecretKey(secretKey);
        return this.swap.addLiquidity(
          reserve,
          poolAddress,
          treasuryAddress,
          lptAddress,
          srcAddress,
          payer
        );
      }).then(txId => {
        return this.setState({ ...EMPTY, txId });
      }).catch(er => {
        return this.setState({ ...EMPTY }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes, visible, onClose } = this.props;
    const { loading, amounts, accountData } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1">Add Liquidity</Typography>
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
            <Typography>Simulated Single Expossure. <span style={{ color: '#808191' }}>Instead of depositing proportionally the amount of three tokens, SSE allows you to deposit even one token. The pool will automatically re-balance itself.</span></Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>Liquidity provider incentive. <span style={{ color: '#808191' }}>Liquidity providers earn a 0.25% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.</span></Typography>
          </Grid>
          <Grid item xs={12}>
            <Drain size={2} />
          </Grid>
          {accountData.map((data, index) => {
            const { amount, mint } = data;
            const { symbol, name, icon, decimals } = mint || {}
            return <Fragment key={index}>
              <Grid item xs={12} >
                <TextField
                  label={name}
                  variant="contained"
                  placeholder="0"
                  value={amounts[index]}
                  onChange={(e) => this.onAmount(index, e)}
                  InputProps={{
                    startAdornment: <Grid container>
                      <Grid item>
                        <MintAvatar icon={icon} />
                      </Grid>
                      <Grid item>
                        <Typography color="textSecondary">{symbol}</Typography>
                      </Grid>
                      <Grid item style={{ paddingLeft: 0 }}>
                        <Divider orientation="vertical" />
                      </Grid>
                    </Grid>
                  }}
                  helperText={`Available ${utils.prettyNumber(ssjs.undecimalize(amount, decimals))} ${symbol || ''}`}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} />
            </Fragment>
          })}
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              endIcon={loading ? <CircularProgress size={17} /> : null}
              disabled={loading}
              fullWidth
            >
              <Typography>Deposit</Typography>
            </Button>
          </Grid>
          <Grid item xs={12} />
        </Grid>
      </DialogContent>
    </Dialog>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet, unlockWallet, syncWallet,
  getAccountData,
}, dispatch);

AddLiquidity.defaultProps = {
  visible: true,
  onClose: () => { },
}

AddLiquidity.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AddLiquidity)));