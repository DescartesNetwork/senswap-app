import React, { Component, Fragment } from 'react';
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
import CircularProgress from 'senswap-ui/circularProgress';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Paper from 'senswap-ui/paper';
import Drain from 'senswap-ui/drain';

import { CloseRounded, OpenInNewRounded } from '@material-ui/icons';

import MintAvatar from 'containers/wallet/components/mintAvatar';

import styles from './styles';
import sol from 'helpers/sol';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';


const DEFAULT_STATE = {
  address: '',
  loading: false,
  existing: false,
}

class CreateAccount extends Component {
  constructor() {
    super();

    this.state = {
      ...DEFAULT_STATE
    }

    this.wallet = window.senswap.wallet;
    this.splt = window.senswap.splt;
  }

  componentDidMount() {
    this.genAccountAddress();
  }

  componentDidUpdate(prevProps) {
    const { visible: prevVisible } = prevProps;
    const { visible } = this.props;
    if (!isEqual(prevVisible, visible) && visible) this.genAccountAddress();
    if (!isEqual(prevVisible, visible) && !visible) this.setState({ ...DEFAULT_STATE });
  }

  genAccountAddress = () => {
    const {
      mintData: { address: mintAddress },
      wallet: { user: { address: mainAddress } },
      setError
    } = this.props;
    return sol.scanAccount(mintAddress, mainAddress).then(({ address, state }) => {
      if (!state) return this.setState({ address });
      return this.setState({ address, existing: true });
    }).catch(er => {
      return setError(er);
    });
  }

  newAccount = () => {
    const {
      wallet: { accounts },
      mintData: { address: mintAddress },
      onClose, setError, updateWallet
    } = this.props;
    const { address } = this.state;
    if (!ssjs.isAddress(mintAddress) || !ssjs.isAddress(address)) return setError('Invalid account/token address');

    return this.setState({ loading: true }, () => {
      return this.splt.initializeAccount(address, mintAddress, this.wallet).then(txId => {
        const newAccounts = [...accounts];
        if (!newAccounts.includes(address)) newAccounts.push(address);
        return updateWallet({ accounts: newAccounts });
      }).then(re => {
        return this.setState({ loading: false }, () => {
          return onClose();
        });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { visible, mintData: { address: mintAddress, icon, name, symbol }, onClose } = this.props;
    const { existing, loading, address } = this.state;

    return <Dialog open={visible} onClose={onClose} fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item>
            <MintAvatar icon={icon} />
          </Grid>
          <Grid item className={classes.stretch}>
            <Typography variant="subtitle1" style={{ marginBottom: -6 }}>Create {symbol}</Typography>
            <Typography variant="body2" color="textSecondary">{name}</Typography>
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
            <Paper className={classes.paperInCreateAccount}>
              <Grid container className={classes.noWrap} alignItems="flex-end">
                <Grid item className={classes.stretch}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">{symbol} ADDRESS</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography>{mintAddress}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <IconButton
                    href={utils.explorer(mintAddress)}
                    target="_blank"
                    rel="noopener"
                    edge="end"
                    size="small"
                  >
                    <OpenInNewRounded fontSize="small" color="disabled" />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.paperInCreateAccount}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">YOUR NEW ACCOUNT ADDRESS</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>{address}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain size={1} />
                </Grid>
                {existing ? <Grid item xs={12}>
                  <Typography>The account for {symbol} have already existed. <span style={{ color: '#808191' }}>Due to the easy of use, SenSwap doesn't support Ancillary Token Accounts.</span></Typography>
                </Grid> : null}
              </Grid>
            </Paper>
          </Grid>
          {!existing ? <Fragment>
            <Grid item xs={12}>
              <Paper className={classes.paperInCreateAccount}>
                <Grid container spacing={0}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">TRANSACTION FEE</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>0.000005 SOL</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} />
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={this.newAccount}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={17} /> : null}
                fullWidth
              >
                <Typography>New account</Typography>
              </Button>
            </Grid>
          </Fragment> : null}
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

CreateAccount.defaultProps = {
  mintData: {},
  visible: false,
  onClose: () => { },
}

CreateAccount.propTypes = {
  mintData: PropTypes.object,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CreateAccount)));