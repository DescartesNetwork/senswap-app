import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import { IconButton } from 'senswap-ui/button';

import {
  AccountBalanceWalletRounded, NotificationsRounded, ExpandMoreRounded
} from 'senswap-ui/icons';

import AccountAvatar from 'containers/wallet/components/accountAvatar';

import styles from './styles';
import { openWallet } from 'modules/wallet.reducer';


class WalletButton extends Component {

  connectWallet = () => {
    return this.props.openWallet();
  }

  wallet = () => {
    const { wallet: { user: { address } } } = this.props;
    const text = address ? address.substring(0, 3) + '...' + address.substring(address.length - 2, address.length) : 'Connect Wallet';

    if (!address) return <Grid item>
      <Button
        variant="contained"
        color="primary"
        onClick={this.connectWallet}
        startIcon={<AccountBalanceWalletRounded />}
        size="large"
      >
        <Typography noWrap>{text}</Typography>
      </Button>
    </Grid>

    return <Fragment>
      <Grid item>
        <IconButton>
          <NotificationsRounded />
        </IconButton>
      </Grid>
      <Grid item>
        <AccountAvatar address={address} title={address} />
      </Grid>
      <Grid item>
        <Typography>{text}</Typography>
      </Grid>
      <Grid item>
        <IconButton size="small">
          <ExpandMoreRounded />
        </IconButton>
      </Grid>
    </Fragment>
  }

  render() {
    // const { classes } = this.props;

    return <Grid container alignItems="center" justify="flex-end" spacing={1}>
      {this.wallet()}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  openWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletButton)));