import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import TextField from 'senswap-ui/textField';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';
import Link from 'senswap-ui/link';

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar, MintSelection } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMintData } from 'modules/bucket.reducer';
import { openWallet, updateWallet } from 'modules/wallet.reducer';


class From extends Component {
  constructor() {
    super();

    this.state = {
      visibleMintSelection: false,
      accountData: {},
      mintData: {},
      bidValue: '',
    }
  }

  onOpenMintSelection = () => this.setState({ visibleMintSelection: true });
  onCloseMintSelection = () => this.setState({ visibleMintSelection: false });

  onAccountData = (accountData) => {
    return this.setState({ accountData, bidValue: '' }, () => {
      this.onCloseAccountSelection();
    });
  }

  onMintData = (data) => {
    const { address: mintAddress } = data;
    const { setError, getMintData, wallet: { user: { address: walletAddress } } } = this.props;
    return getMintData(mintAddress).then(mintData => {
      return this.setState({ mintData, bidValue: '' }, () => {
        return sol.scanAccount(mintAddress, walletAddress).then(data => {
          const emptyAccountData = { address: '', amount: 0n, mint: mintData }
          const { address: accountAddress } = data || {}
          return this.setState({
            accountData: !ssjs.isAddress(accountAddress) ? emptyAccountData : data
          }, this.onCloseMintSelection);
        });
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onBidValue = (e) => {
    const bidValue = e.target.value || '';
    return this.setState({ bidValue }, () => {
    });
  }

  onMax = () => {
    const { accountData: { amount, mint } } = this.state;
    const { decimals } = mint || {}
    const value = ssjs.undecimalize(amount, decimals);
    const pseudoEvent = { target: { value } }
    return this.onBidValue(pseudoEvent);
  }

  render() {
    const { classes } = this.props;
    const {
      visibleMintSelection,
      accountData: { amount: balance, mint: mintData },
      bidValue,
    } = this.state;

    const { icon, symbol, decimals } = mintData || {};

    return <Grid container>
      <Grid item xs={12}>
        <TextField
          variant="contained"
          label="From"
          placeholder="0"
          value={bidValue}
          onChange={this.onBidValue}
          InputProps={{
            startAdornment: <Grid container className={classes.noWrap}>
              <Grid item>
                <Button
                  size="small"
                  startIcon={<MintAvatar icon={icon} />}
                  endIcon={<ArrowDropDownRounded />}
                  onClick={this.onOpenMintSelection}
                >
                  <Typography>{symbol || 'Select'}</Typography>
                </Button>
              </Grid>
              <Grid item style={{ paddingLeft: 0 }}>
                <Divider orientation="vertical" />
              </Grid>
            </Grid>
          }}
          helperTextPrimary={`Available: ${utils.prettyNumber(ssjs.undecimalize(balance, decimals)) || 0} ${symbol || ''}`}
          helperTextSecondary={<Link color="primary" onClick={this.onMax} variant="body2">MAXIMUM</Link>}
        />
        <MintSelection
          visible={visibleMintSelection}
          onChange={this.onMintData}
          onClose={this.onCloseMintSelection}
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  updateWallet, openWallet,
  getPools, getPool,
  getMintData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(From)));