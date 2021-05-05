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

import { ArrowDropDownRounded } from 'senswap-ui/icons';

import Header from './header';
import Introduction from './introduction';
import { MintAvatar, MintSelection, AccountSelection } from 'containers/wallet';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';

class Swap extends Component {
  constructor() {
    super();

    this.state = {
      visibleAccountSelection: false,
      accountData: {},
      visibleMintSelection: false,
      mintData: {},
    }
  }

  onOpenAccountSelection = (index) => this.setState({ index, visibleAccountSelection: true });
  onCloseAccountSelection = () => this.setState({ visibleAccountSelection: false });

  onOpenMintSelection = (index) => this.setState({ index, visibleMintSelection: true });
  onCloseMintSelection = () => this.setState({ visibleMintSelection: false });

  onAccountData = (accountData) => {
    return this.setState({ accountData }, () => {
      return this.onCloseAccountSelection();
    });
  }

  onMintData = (mintData) => {
    return this.setState({ mintData }, () => {
      return this.onCloseMintSelection();
    });
  }

  renderAction = () => {
    const { wallet: { user: { address } } } = this.props;
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
      fullWidth
    >
      <Typography>Swap</Typography>
    </Button>
  }

  render() {
    const { classes, ui: { width } } = this.props;
    const {
      visibleAccountSelection, accountData: { amount: balance, mint: bidMintData },
      visibleMintSelection, mintData: askMintData
    } = this.state;

    const { icon: bidIcon, symbol: bidSymbol, decimals } = bidMintData || {};
    const { icon: askIcon, symbol: askSymbol } = askMintData || {};

    return <Grid container>
      <Grid item xs={12}>
        <Header />
      </Grid>
      <Grid item xs={12}>
        <Drain size={3} />
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
                        InputProps={{
                          startAdornment: <Grid container className={classes.noWrap}>
                            <Grid item>
                              <Button
                                size="small"
                                startIcon={<MintAvatar icon={bidIcon} />}
                                endIcon={<ArrowDropDownRounded />}
                                onClick={this.onOpenAccountSelection}
                              >
                                <Typography>{bidSymbol || 'Select'} </Typography>
                              </Button>
                            </Grid>
                            <Grid item style={{ paddingLeft: 0 }}>
                              <Divider orientation="vertical" />
                            </Grid>
                          </Grid>
                        }}
                        helperText={`Available: ${utils.prettyNumber(ssjs.undecimalize(balance, decimals))} ${bidSymbol || ''}`}
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
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Swap)));