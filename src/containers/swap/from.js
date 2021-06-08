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
import TextField from 'senswap-ui/textField';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';
import Link from 'senswap-ui/link';

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import { MintAvatar } from 'containers/wallet';
import { PoolSelection } from 'containers/pool';

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
    }
  }

  onOpen = () => this.setState({ visible: true });
  onClose = () => this.setState({ visible: false });

  onData = async ({ mintData, poolData }) => {
    const {
      wallet: { user: { address: walletAddress } },
      setError, getAccountData, onChange, value
    } = this.props;
    const { address: mintAddress } = mintData;
    if (!ssjs.isAddress(walletAddress)) return;
    this.setState({ loading: true }, this.onClose);
    try {
      let accountData = await sol.scanAccount(mintAddress, walletAddress);
      const { state, address: accountAddress } = accountData || {}
      if (!state) accountData = { address: '', amount: 0n, mint: mintData };
      else accountData = await getAccountData(accountAddress);
      onChange({ accountData, poolData, value });
    } catch (er) {
      await setError(er);
    }
    return this.setState({ loading: false });
  }

  onValue = (e) => {
    const { onChange, accountData, poolData } = this.props;
    const value = e.target.value || '';
    return onChange({ accountData, poolData, value });
  }

  onMax = () => {
    const { accountData: { amount, mint } } = this.props;
    const { decimals } = mint || {}
    const value = ssjs.undecimalize(amount, decimals);
    const pseudoEvent = { target: { value } }
    return this.onValue(pseudoEvent);
  }

  render() {
    const { classes, accountData, value, refPoolAddress } = this.props;
    const { loading, visible } = this.state;
    const { amount, mint: mintData } = accountData || {}
    const { icon, symbol, decimals } = mintData || {}

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
        <PoolSelection
          visible={visible}
          onChange={this.onData}
          onClose={this.onClose}
          refPoolAddresses={[]}
          mintData={mintData}
          refPoolAddress={refPoolAddress}
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
  accountData: {},
  poolData: {},
  value: '',
  onChange: () => { },
  refPoolAddress: '',
}

From.propTypes = {
  accountData: PropTypes.object,
  poolData: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  refPoolAddress: PropTypes.string,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(From)));