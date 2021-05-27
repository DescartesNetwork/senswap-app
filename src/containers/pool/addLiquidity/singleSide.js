import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import CircularProgress from 'senswap-ui/circularProgress';
import TextField from 'senswap-ui/textField';
import Divider from 'senswap-ui/divider';
import Link from 'senswap-ui/link';

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar, MintSelection } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError, setSuccess } from 'modules/ui.reducer';
import { updateWallet } from 'modules/wallet.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class SingleSide extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visible: false,
      amount: '',
      accountData: {},
    }
  }

  componentDidMount() {
    this.onChange(); // Reset state
  }

  onOpen = () => this.setState({ visible: true });
  onClose = () => this.setState({ visible: false });

  onMintData = async (mintData) => {
    const { wallet: { user: { address: walletAddress } }, getAccountData, setError } = this.props;
    const { address: mintAddress } = mintData || {}
    this.setState({ loading: true }, this.onClose);
    try {
      let accountData = await sol.scanAccount(mintAddress, walletAddress);
      const { state, address: accountAddress } = accountData || {}
      if (!state) accountData = { address: '', amount: 0n, mint: mintData };
      else accountData = await getAccountData(accountAddress);
      return this.setState({ accountData, loading: false }, this.onChange);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onAmount = (e) => {
    const amount = e.target.value || '';
    return this.setState({ amount }, this.onChange);
  }

  onMax = () => {
    const { accountData } = this.state;
    const { amount: balance, mint } = accountData || {}
    const { decimals } = mint || {}
    const amount = ssjs.undecimalize(balance, decimals) || 0;
    return this.setState({ amount }, this.onChange);
  }

  onChange = () => {
    const { poolData, onChange } = this.props;
    // Parse pool data
    const { address: poolAddress, mint_a, mint_b, mint_s } = poolData;
    let amounts = ['', '', ''];
    if (!ssjs.isAddress(poolAddress)) return onChange(amounts);
    const { address: mintSAddress } = mint_s || {}
    const { address: mintAAddress } = mint_a || {}
    const { address: mintBAddress } = mint_b || {}
    // Parse account data
    const { amount, accountData } = this.state;
    const { mint } = accountData || {}
    const { address: mintAddress } = mint || {}
    if (!ssjs.isAddress(mintAddress)) return onChange(amounts);
    // Synthetize amounts
    if (mintAddress === mintSAddress) amounts[0] = amount;
    if (mintAddress === mintAAddress) amounts[1] = amount;
    if (mintAddress === mintBAddress) amounts[2] = amount;
    return onChange(amounts);
  }

  render() {
    const { classes, poolData } = this.props;
    const { visible, amount, accountData, loading } = this.state;

    const { address: poolAddress, mint_a, mint_b, mint_s } = poolData;
    if (!ssjs.isAddress(poolAddress)) return null;
    const { address: mintSAddress } = mint_s || {}
    const { address: mintAAddress } = mint_a || {}
    const { address: mintBAddress } = mint_b || {}
    const condition = { '$or': [{ address: mintSAddress }, { address: mintAAddress }, { address: mintBAddress }] }

    const { mint: mintData, amount: balance } = accountData;
    const { icon, symbol, decimals } = mintData || {};

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="contained"
          placeholder="0"
          value={amount}
          onChange={this.onAmount}
          InputProps={{
            startAdornment: <Grid container className={classes.noWrap}>
              <Grid item>
                <Button
                  size="small"
                  startIcon={loading ? <CircularProgress size={32} /> : <MintAvatar icon={icon} />}
                  endIcon={<ArrowDropDownRounded />}
                  onClick={this.onOpen}
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
          helperTextSecondary={<Grid container justify="flex-end">
            <Grid item>
              <Link color="primary" onClick={this.onMax} variant="body2">MAXIMUM</Link>
            </Grid>
          </Grid>}
        />
        <MintSelection
          visible={visible}
          condition={condition}
          onChange={this.onMintData}
          onClose={this.onClose}
          always
        />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError, setSuccess,
  updateWallet,
  getAccountData,
}, dispatch);

SingleSide.defaultProps = {
  poolData: {},
  onChange: () => { },
}

SingleSide.propTypes = {
  poolData: PropTypes.object,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(SingleSide)));