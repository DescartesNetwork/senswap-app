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
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class From extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
      visible: false,
      accountData: {},
      value: '',
    }
  }

  componentDidMount = () => {
    const { value } = this.props;
    this.setState({ value }, this.onDesireMintAddress);
  }

  componentDidUpdate = (prevProps) => {
    const {
      value: prevValue, mintAddress: prevMintAddress,
      wallet: { user: { address: prevAddress } },
    } = prevProps;
    const { value, wallet: { user: { address } }, mintAddress } = this.props;
    if (!isEqual(prevValue, value)) this.setState({ value });
    if (!isEqual(prevMintAddress, mintAddress)) this.onDesireMintAddress();
    if (!isEqual(prevAddress, address)) this.onDesireMintAddress();
  }

  onDesireMintAddress = () => {
    const { mintAddress } = this.props;
    if (ssjs.isAddress(mintAddress)) return this.onMintData({ address: mintAddress });
  }

  onOpen = () => this.setState({ visible: true });
  onClose = () => this.setState({ visible: false });

  onMintData = async (mintData) => {
    const { address: mintAddress } = mintData;
    const { setError, getAccountData, wallet: { user: { address: walletAddress } } } = this.props;
    if (!ssjs.isAddress(walletAddress)) return;
    try {
      this.setState({ loading: true }, this.onClose);
      let accountData = await sol.scanAccount(mintAddress, walletAddress);
      const { state, address: accountAddress } = accountData || {}
      if (!state) accountData = { address: '', amount: 0n, mint: mintData };
      else accountData = await getAccountData(accountAddress);
      return this.setState({ loading: false, accountData, value: '' }, this.returnData);
    } catch (er) {
      await setError(er);
      return this.setState({ loading: false });
    }
  }

  onValue = (e) => {
    const value = e.target.value || '';
    return this.setState({ value }, this.returnData);
  }

  onMax = () => {
    const { accountData: { amount, mint } } = this.state;
    const { decimals } = mint || {}
    const value = ssjs.undecimalize(amount, decimals);
    const pseudoEvent = { target: { value } }
    return this.onValue(pseudoEvent);
  }

  returnData = () => {
    const { onChange } = this.props;
    const { accountData, value } = this.state;
    return onChange({ accountData, value });
  }

  render() {
    const { classes } = this.props;
    const { loading, visible, accountData, value } = this.state;
    const { amount, mint } = accountData || {}
    const { icon, symbol, decimals } = mint || {}

    return <Grid container>
      <Grid item xs={12}>
        <TextField
          variant="contained"
          label="From"
          placeholder="0"
          value={value}
          onChange={this.onValue}
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
          helperTextPrimary={`Available: ${utils.prettyNumber(ssjs.undecimalize(amount, decimals)) || 0} ${symbol || ''}`}
          helperTextSecondary={<Grid container justify="flex-end">
            <Grid item>
              <Link color="primary" onClick={this.onMax} variant="body2">MAXIMUM</Link>
            </Grid>
          </Grid>}
        />
        <MintSelection
          visible={visible}
          onChange={this.onMintData}
          onClose={this.onClose}
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
  setError,
  getAccountData,
}, dispatch);

From.defaultProps = {
  mintAddress: '',
  value: '',
  onChange: () => { },
}

From.propTypes = {
  mintAddress: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(From)));