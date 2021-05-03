import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import Badge from 'senswap-ui/badge';

import { AccountBalanceWalletOutlined, NotificationsOutlined, ExpandMoreRounded } from 'senswap-ui/icons';

import { AccountAvatar } from 'containers/wallet';

import styles from './styles';
import { openWallet, closeWallet } from 'modules/wallet.reducer';


class WalletButton extends Component {

  walletButton = () => {
    const { wallet: { user: { address } }, openWallet } = this.props;
    const text = address ? address.substring(0, 3) + '...' + address.substring(address.length - 2, address.length) : 'Connect Wallet';

    if (!address) return <Grid item>
      <Button
        variant="contained"
        color="primary"
        onClick={openWallet}
        startIcon={<AccountBalanceWalletOutlined />}
        size="large"
      >
        <Typography noWrap>{text}</Typography>
      </Button>
    </Grid>

    return <Fragment>
      <Grid item>
        <IconButton>
          <Badge variant="dot" color="primary">
            <NotificationsOutlined />
          </Badge>
        </IconButton>
      </Grid>
      <Grid item>
        <AccountAvatar address={address} title={address} />
      </Grid>
      <Grid item>
        <Typography>{text}</Typography>
      </Grid>
      <Grid item>
        <IconButton size="small" component={RouterLink} to="/wallet">
          <ExpandMoreRounded />
        </IconButton>
      </Grid>
    </Fragment>
  }

  render() {
    return <Grid container alignItems="center" justify="flex-end" spacing={1}>
      {this.walletButton()}
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  openWallet, closeWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(WalletButton)));