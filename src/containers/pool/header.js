import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Brand from 'senswap-ui/brand';

import { QueueRounded } from 'senswap-ui/icons';

import { WalletButton } from 'containers/wallet';
import NewPool from './newPool';

import styles from './styles';
import { setError } from 'modules/ui.reducer';
import { unsetWallet } from 'modules/wallet.reducer';


class Wallet extends Component {
  constructor() {
    super();

    this.state = {
      visibleNewPool: false,
      visibleDeposit: false,
    }
  }

  onOpenNewPool = () => this.setState({ visibleNewPool: true });
  onCloseNewPool = () => this.setState({ visibleNewPool: false });

  render() {
    const { classes, wallet: { user: { address } }, ui: { leftbar } } = this.props;
    const { visibleNewPool } = this.state;

    return <Grid container spacing={0}>
      <Grid item xs={12}>
        <Grid container alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            {!leftbar ? <Grid container>
              <Grid item className={classes.opticalCorrectionBrand}>
                <Brand />
              </Grid>
            </Grid> : <Typography>SenSwap</Typography>}
          </Grid>
          {address ? <Grid item>
            <WalletButton />
          </Grid> : null}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Typography variant="h4">Pools</Typography>
          </Grid>
          {!address ? <Grid item>
            <WalletButton />
          </Grid> : <Fragment>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<QueueRounded />}
                onClick={this.onOpenNewPool}
              >
                <Typography>New Pool</Typography>
              </Button>
              <NewPool visible={visibleNewPool} onClose={this.onCloseNewPool} />
            </Grid>
          </Fragment>}
        </Grid>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  unsetWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Wallet)));