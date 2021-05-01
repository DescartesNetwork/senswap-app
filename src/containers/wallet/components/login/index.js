import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button, { IconButton } from 'senswap-ui/button';
import Badge from 'senswap-ui/badge';
import Drain from 'senswap-ui/drain';
import Dialog, { DialogTitle, DialogContent } from 'senswap-ui/dialog';
import Tooltip from 'senswap-ui/tooltip';
import Chip from 'senswap-ui/chip';
import Divider from 'senswap-ui/divider';

import {
  AccountBalanceWalletOutlined, NotificationsOutlined, ExpandMoreRounded,
  CloseRounded, ErrorRounded,
} from 'senswap-ui/icons';

import Collapse from '@material-ui/core/Collapse';
import Switch from '@material-ui/core/Switch';

import AccountAvatar from 'containers/wallet/components/accountAvatar';
import Coin98 from './coin98';
import SecretKey from './secretKey';
import Keystore from './keystore';

import styles from './styles';
import { openWallet, closeWallet } from 'modules/wallet.reducer';


class Login extends Component {
  constructor() {
    super();

    this.state = {
      advance: false,
    }
  }

  onAdvance = (e) => {
    const advance = e.target.checked || false;
    return this.setState({ advance });
  }

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
    const { classes } = this.props;
    const { wallet: { visible }, closeWallet } = this.props;
    const { advance } = this.state;

    return <Grid container alignItems="center" justify="flex-end" spacing={1}>
      {this.walletButton()}
      <Dialog open={visible} onClose={closeWallet}>
        <DialogTitle>
          <Grid container alignItems="center" className={classes.noWrap}>
            <Grid item className={classes.stretch}>
              <Typography variant="h6"><strong>Connect Wallet</strong></Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={closeWallet} edge="end">
                <CloseRounded />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Coin98 />
            </Grid>
            <Grid item xs={12}>
              <Drain size={2} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={0} alignItems="center" className={classes.noWrap}>
                <Grid item className={classes.stretch}>
                  <Typography variant="subtitle1">Other methods</Typography>
                </Grid>
                <Grid item>
                  <Tooltip title="Caution! This format is not recommended due to a lack of cryptographical protection. By switching the button, you agree that you will use this function at your own risk.">
                    <Chip
                      icon={<ErrorRounded className={classes.warning} />}
                      label="Caution!"
                      clickable
                    />
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Switch color="primary" checked={advance} onClick={this.onAdvance} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={advance}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Keystore />
                  </Grid>
                  <Grid item xs={12}>
                    <Drain size={2} />
                  </Grid>
                  <Grid item xs={12}>
                    <SecretKey />
                  </Grid>
                  <Grid item xs={12}>
                    <Drain size={2} />
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
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
)(withStyles(styles)(Login)));