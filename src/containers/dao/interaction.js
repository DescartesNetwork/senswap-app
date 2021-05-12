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
import Button, { IconButton } from 'senswap-ui/button';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Paper from 'senswap-ui/paper';
import TextField from 'senswap-ui/textField';

import { CloseRounded } from 'senswap-ui/icons';

import { PoolAvatar } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';


class Interaction extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      receiverAddress: ''
    }

    this.swap = window.senswap.swap;
  }

  onAutogenDestinationAddress = (mintAddress) => {
    return new Promise((resolve, reject) => {
      if (!mintAddress) return reject('Unknown token');
      const { wallet: { accounts }, updateWallet } = this.props;
      let accountAddress = null;
      return sol.newAccount(mintAddress).then(({ address }) => {
        accountAddress = address;
        const newAccounts = [...accounts];
        if (!newAccounts.includes(accountAddress)) newAccounts.push(accountAddress);
        return updateWallet({ accounts: newAccounts });
      }).then(re => {
        return resolve(accountAddress);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  onAddress = (e) => {
    const receiverAddress = e.target.value || '';
    return this.setState({ receiverAddress });
  }

  onGenerate = () => {
    const { setError, poolData } = this.props;
    const { mint_s: { address } } = poolData;
    return this.onAutogenDestinationAddress(address).then(receiverAddress => {
      return this.setState({ receiverAddress });
    }).catch(er => {
      return setError(er);
    });
  }

  earn = () => {
    const { setError, poolData, onClose } = this.props;
    const { receiverAddress } = this.state;
    const { address: poolAddress, vault: { amount } } = poolData;
    return this.swap.earn(amount, poolAddress, receiverAddress, window.senswap.wallet).then(txId => {
      console.log(txId);
      return onClose();
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes, visible, onClose, poolData } = this.props;
    const { receiverAddress } = this.state;

    const {
      state, vault,
      mint_s, mint_a, mint_b, mint_lpt,
      reserve_s, reserve_a, reserve_b,
    } = poolData;
    const { decimals } = mint_lpt || {}
    const { symbol: symbolS, icon: iconS, decimals: decimalsS } = mint_s || {}
    const { symbol: symbolA, icon: iconA, decimals: decimalsA } = mint_a || {}
    const { symbol: symbolB, icon: iconB, decimals: decimalsB } = mint_b || {}
    const { amount: earn } = vault || {}
    const icons = [iconA, iconB, iconS];

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Grid container alignItems="center" className={classes.noWrap}>
              <Grid item>
                <PoolAvatar icons={icons} />
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">{`${symbolA || '.'}/${symbolB || '.'}/${symbolS || '.'}`}</Typography>
              </Grid>
            </Grid>
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
          <Grid item xs={12} >
            <Paper className={classes.paperInReceive}>
              <Grid container>
                <Grid item xs={12} >
                  <Typography variant="subtitle1">Reserves</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Typography color="textSecondary">{symbolS}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{utils.prettyNumber(ssjs.undecimalize(reserve_s, decimalsS))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Typography color="textSecondary">{symbolA}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{utils.prettyNumber(ssjs.undecimalize(reserve_a, decimalsA))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Typography color="textSecondary">{symbolB}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{utils.prettyNumber(ssjs.undecimalize(reserve_b, decimalsB))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12} >
            <Paper className={classes.paperInReceive}>
              <Grid container>
                <Grid item xs={12} >
                  <Typography variant="subtitle1">Earn</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container className={classes.noWrap}>
                    <Grid item className={classes.stretch}>
                      <Typography color="textSecondary">{symbolS}</Typography>
                    </Grid>
                    <Grid item>
                      <Typography>{utils.prettyNumber(ssjs.undecimalize(earn, decimals))}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="contained"
              label="Receiver Address"
              value={receiverAddress}
              onChange={this.onAddress}
              helperTextSecondary={`Pool Status: ${state}`}
              InputProps={{
                endAdornment: <Button color="primary" onClick={this.onGenerate}>
                  <Typography>Auto</Typography>
                </Button>
              }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={this.earn}
              fullWidth
            >
              <Typography>Earn</Typography>
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet,
}, dispatch);

Interaction.defaultProps = {
  visible: false,
  onClose: () => { },
  poolData: {},
}

Interaction.propsType = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Interaction)));