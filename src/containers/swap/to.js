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
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { getAccountData } from 'modules/bucket.reducer';


class To extends Component {
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

  render() {
    const { classes, accountData, onSlippage, slippage, value, refPoolAddress } = this.props;
    const { loading, visible } = this.state;
    const { mint: mintData } = accountData || {}
    const { icon, symbol } = mintData || {}

    return <Grid container>
      <Grid item xs={12}>
        <TextField
          variant="contained"
          label="To"
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
                  <Typography>{symbol || 'Select'} </Typography>
                </Button>
              </Grid>
              <Grid item style={{ paddingLeft: 0 }}>
                <Divider orientation="vertical" />
              </Grid>
            </Grid>
          }}
          helperTextPrimary="Max slippage"
          helperTextSecondary={
            <Grid container justify="flex-end" className={classes.noWrap}>
              <Grid item>
                <Link
                  color={slippage === 0.01 ? 'primary' : 'textSecondary'}
                  onClick={() => onSlippage(0.01)}
                  variant="body2"
                >1%</Link>
              </Grid>
              <Grid item>
                <Link
                  color={slippage === 0.05 ? 'primary' : 'textSecondary'}
                  onClick={() => onSlippage(0.05)}
                  variant="body2"
                >5%</Link>
              </Grid>
              <Grid item>
                <Link
                  color={slippage === 0.1 ? 'primary' : 'textSecondary'}
                  onClick={() => onSlippage(0.1)}
                  variant="body2"
                >10%</Link>
              </Grid>
              <Grid item>
                <Link
                  color={slippage === -1 ? 'primary' : 'textSecondary'}
                  onClick={() => onSlippage(-1)}
                  variant="body2"
                >Free</Link>
              </Grid>
            </Grid>
          }
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
  getAccountData
}, dispatch);

To.defaultProps = {
  accountData: {},
  poolData: {},
  slippage: 0.01,
  value: '',
  onSlippage: () => { },
  onChange: () => { },
  refPoolAddress: '',
}

To.propTypes = {
  accountData: PropTypes.object,
  poolData: PropTypes.object,
  limit: PropTypes.number,
  value: PropTypes.string,
  onLimit: PropTypes.func,
  onChange: PropTypes.func,
  refPoolAddress: PropTypes.string,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(To)));