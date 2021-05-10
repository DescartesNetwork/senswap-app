import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Drain from 'senswap-ui/drain';
import Paper from 'senswap-ui/paper';
import TextField from 'senswap-ui/textField';
import Brand from 'senswap-ui/brand';
import Divider from 'senswap-ui/divider';
import CircularProgress from 'senswap-ui/circularProgress';

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import Header from './header';
import Introduction from './introduction';
import { MintAvatar, MintSelection, AccountSelection } from 'containers/wallet';

import styles from './styles';
import oracle from 'helpers/oracle';
import utils from 'helpers/utils';
import sol from 'helpers/sol';
import { setError } from 'modules/ui.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { getMintData, getPoolData } from 'modules/bucket.reducer';
import { updateWallet } from 'modules/wallet.reducer';

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      txId: '',
      visibleAccountSelection: false,
      visibleMintSelection: false,
      accountData: {},
      mintData: {},
      bidValue: '',
      askValue: '',
      hopData: [],
    }

    this.swap = window.senswap.swap;
  }

  _routing = (srcIds, dstIds) => {
    for (let srcId of srcIds) {
      for (let dstId of dstIds) {
        if (srcId === dstId) return [srcId, dstId];
      }
    }
    return [srcIds[0], dstIds[0]];
  }

  routing = (srcMintAddress, dstMintAddress) => {
    return new Promise((resolve, reject) => {
      if (!ssjs.isAddress(srcMintAddress)) return reject('Invalid source mint address');
      if (!ssjs.isAddress(dstMintAddress)) return reject('Invalid destination mint address');
      if (srcMintAddress === dstMintAddress) return reject('The pools is identical');

      const { getPool, getPools, getPoolData } = this.props;
      const srcCondition = { '$or': [{ mintS: srcMintAddress }, { mintA: srcMintAddress }, { mintB: srcMintAddress }] }
      const dstCondition = { '$or': [{ mintS: dstMintAddress }, { mintA: dstMintAddress }, { mintB: dstMintAddress }] }
      let srcIds = [];
      let dstIds = [];
      return getPools(srcCondition, -1, 0).then(data => {
        if (!data.length) throw new Error('Cannot find available pools');
        srcIds = data.map(({ _id }) => _id);
        return getPools(dstCondition, -1, 0);
      }).then(data => {
        if (!data.length) throw new Error('Cannot find available pools');
        dstIds = data.map(({ _id }) => _id);
        const route = this._routing(srcIds, dstIds);
        return route.each(_id => getPool(_id));
      }).then(data => {
        if (data.length < 2) throw new Error('Cannot find available pools');
        return data.each(({ address }) => getPoolData(address));
      }).then(data => {
        if (data.length < 2) throw new Error('Cannot find available pools');
        return resolve(data);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  estimateState = (inverse = false) => {
    const { setError } = this.props;
    const { accountData, mintData, bidValue, askValue } = this.state;
    const { mint } = accountData;
    const { address: srcMintAddress, decimals: bidDecimals } = mint || {}
    const { address: dstMintAddress, decimals: askDecimals } = mintData || {}
    if (!ssjs.isAddress(srcMintAddress) || !ssjs.isAddress(dstMintAddress)) return;

    return this.setState({ loading: true }, () => {
      return this.routing(srcMintAddress, dstMintAddress).then(([bidPoolData, askPoolData]) => {
        if (inverse) return oracle.inverseCurve(
          ssjs.decimalize(askValue, askDecimals),
          srcMintAddress, bidPoolData, dstMintAddress, askPoolData);
        return oracle.curve(
          ssjs.decimalize(bidValue, bidDecimals),
          srcMintAddress, bidPoolData, dstMintAddress, askPoolData);
      }).then(data => {
        let bidAmount = null;
        let askAmount = null;
        if (data.length === 1) [{ askAmount, bidAmount }] = data;
        else if (data.length === 2) [{ bidAmount }, { askAmount }] = data;
        else throw new Error('Cannot find available pools');
        return this.setState({ loading: false, hopData: data }, () => {
          if (inverse) return this.setState({ bidValue: ssjs.undecimalize(bidAmount, bidDecimals) });
          return this.setState({ askValue: ssjs.undecimalize(askAmount, askDecimals) });
        });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  onOpenAccountSelection = () => this.setState({ visibleAccountSelection: true });
  onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });

  onOpenMintSelection = () => this.setState({ visibleMintSelection: true });
  onCloseMintSelection = () => this.setState({ visibleMintSelection: false });

  onAccountData = (accountData) => {
    return this.setState({ accountData, bidValue: '', askValue: '' }, () => {
      return this.onCloseAccountSelection();
    });
  }

  onMintData = (data) => {
    const { address: mintAddress } = data;
    const { setError, getMintData } = this.props;
    return getMintData(mintAddress).then(mintData => {
      return this.setState({ mintData, bidValue: '', askValue: '' }, () => {
        return this.onCloseMintSelection();
      });
    }).catch(er => {
      return setError(er);
    });
  }

  onBidValue = (e) => {
    const bidValue = e.target.value || '';
    return this.setState({ bidValue }, () => {
      return this.estimateState();
    });
  }

  onAskValue = (e) => {
    const askValue = e.target.value || '';
    return this.setState({ askValue }, () => {
      return this.estimateState(true);
    });
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

  executeSwap = () => {
    const { setError } = this.props;
    const { accountData, mintData, bidAmount, hopData } = this.state;
    const { address: srcAddress } = accountData;
    const [{ address: poolAddress }] = hopData;
    const { address: dstMintAddress } = mintData || {}
    this.setState({ loading: true }, () => {
      return this.onAutogenDestinationAddress(dstMintAddress).then(dstAddress => {
        return this.swap.swap(bidAmount, poolAddress, srcAddress, dstAddress, window.senswap.wallet);
      }).then(txId => {
        return this.setState({ loading: false, txId });
      }).catch(er => {
        return this.setState({ loading: false }, () => {
          return setError(er);
        });
      });
    });
  }

  renderAction = () => {
    const { wallet: { user: { address } } } = this.props;
    const { loading } = this.state;
    if (!ssjs.isAddress(address)) return <Button
      variant="contained"
      color="primary"
      size="large"
      fullWidth
    >
      <Typography>Connect Wallet</Typography>
    </Button>
    return <Button
      variant="contained"
      color="primary"
      size="large"
      disabled={loading}
      startIcon={loading ? <CircularProgress size={17} /> : null}
      onClick={this.executeSwap}
      fullWidth
    >
      <Typography>Swap</Typography>
    </Button>
  }

  render() {
    const { classes, ui: { width } } = this.props;
    const {
      visibleAccountSelection, visibleMintSelection,
      accountData: { amount: balance, mint: bidMintData }, mintData: askMintData,
      bidValue, askValue, hopData,
    } = this.state;

    const { icon: bidIcon, symbol: bidSymbol, decimals } = bidMintData || {};
    const { icon: askIcon, symbol: askSymbol } = askMintData || {};

    return <Grid container>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain />
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper className={classes.paper}>
          <Grid container>
            <Grid item xs={12} md={4}>
              <div
                className={width < 960 ? classes.imageColumn : classes.imageRow}
                style={{
                  background: 'url("https://source.unsplash.com/random")',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <Grid container>
                  <Grid item xs={12} >
                    <Brand />
                  </Grid>
                  <Grid item xs={12}>
                    <Drain size={8} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h2">Let's Swap</Typography>
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container justify="center">
                <Grid item xs={11}>
                  <Grid container>
                    <Grid item xs={12}>
                      <Drain />
                    </Grid>
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
                                startIcon={<MintAvatar icon={bidIcon} />}
                                endIcon={<ArrowDropDownRounded />}
                                onClick={this.onOpenAccountSelection}
                              >
                                <Typography>{bidSymbol || 'Select'}</Typography>
                              </Button>
                            </Grid>
                            <Grid item style={{ paddingLeft: 0 }}>
                              <Divider orientation="vertical" />
                            </Grid>
                          </Grid>,
                          endAdornment: <Button
                            size="small"
                            color="primary"
                          >
                            <Typography>MAX</Typography>
                          </Button>
                        }}
                        helperText={`Available: ${utils.prettyNumber(ssjs.undecimalize(balance, decimals)) || 0} ${bidSymbol || ''}`}
                      />
                      <AccountSelection
                        visible={visibleAccountSelection}
                        onClose={this.onCloseAccountSelection}
                        onChange={this.onAccountData}
                        solana={false}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="contained"
                        label="To"
                        placeholder="0"
                        value={askValue}
                        onChange={this.onAskValue}
                        InputProps={{
                          startAdornment: <Grid container className={classes.noWrap}>
                            <Grid item>
                              <Button
                                size="small"
                                startIcon={<MintAvatar icon={askIcon} />}
                                endIcon={<ArrowDropDownRounded />}
                                onClick={this.onOpenMintSelection}
                              >
                                <Typography>{askSymbol || 'Select'} </Typography>
                              </Button>
                            </Grid>
                            <Grid item style={{ paddingLeft: 0 }}>
                              <Divider orientation="vertical" />
                            </Grid>
                          </Grid>
                        }}
                      />
                      <MintSelection
                        visible={visibleMintSelection}
                        onChange={this.onMintData}
                        onClose={this.onCloseMintSelection}
                      />
                    </Grid>
                    <Grid item xs={12} />
                    <Grid item xs={12}>
                      {this.renderAction()}
                    </Grid>
                    <Grid item xs={12}>
                      <Drain />
                    </Grid>
                    <Grid item xs={12}>
                      {hopData.map((data, index) => {
                        const {
                          srcMintAddress, bidAmount,
                          dstMintAddress, askAmount,
                          fee, ratio, slippage,
                        } = data;
                        console.log(data)
                        return <Grid container key={index}>
                          <Grid item xs={12}>
                            <Typography>Hop #{index}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography>Source Mint Address</Typography>
                            <Typography>{srcMintAddress}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography>Destination Mint Address</Typography>
                            <Typography>{dstMintAddress}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>Bid Amount</Typography>
                            <Typography>{ssjs.undecimalize(bidAmount, 9)}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography>Ask Amount</Typography>
                            <Typography>{ssjs.undecimalize(askAmount, 9)}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>Fee</Typography>
                            <Typography>{ssjs.undecimalize(fee, 9) * 100}%</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>Ratio</Typography>
                            <Typography>{ratio}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography>Slippage</Typography>
                            <Typography>{ssjs.undecimalize(slippage, 9) * 100}%</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider />
                          </Grid>
                        </Grid>
                      })}
                    </Grid>
                    <Grid item xs={12}>
                      <Drain />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Introduction />
      </Grid>
    </Grid >
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
  pool: state.pool,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  updateWallet,
  getPools, getPool,
  getMintData, getPoolData,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));