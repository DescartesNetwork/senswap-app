import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import Image from 'material-ui-image';

import {
  SwapCallsRounded, LocalGasStationRounded,
  WidgetsRounded, ColorizeRounded,
  AccountBalanceRounded, VerifiedUserRounded, DescriptionRounded,
} from '@material-ui/icons';

import AccountAvatar from 'containers/wallet/components/accountAvatar';

import styles from './styles';
import SEN_LOGO from 'static/images/sen-logo.svg';
import WHITEPAPER from 'static/docs/senswap_whitepaper.pdf';
import { openWallet } from 'modules/wallet.reducer';


class Header extends Component {
  constructor() {
    super();

    this.state = {
      anchorEl: null,
    }
  }

  parseRoute = () => {
    const { location: { pathname } } = this.props;
    const route = pathname.split('/')[1];
    return route;
  }

  connectWallet = () => {
    return this.props.openWallet();
  }

  walletConnectionButton = () => {
    const {
      ui: { width },
      wallet: { user: { address } },
    } = this.props;
    const text = address ? address.substring(0, 3) + '...' + address.substring(address.length - 3, address.length) : 'Connect Wallet';
    if (width >= 600) return <Grid item>
      <Button onClick={this.connectWallet} startIcon={<AccountAvatar address={address} title={address || text} />} >
        <Typography noWrap>{text}</Typography>
      </Button>
    </Grid>
    return <Grid item>
      <AccountAvatar address={address} title={address || text} onClick={this.connectWallet} />
    </Grid>
  }

  onOpenOthers = (e) => {
    return this.setState({ anchorEl: e.target });
  }

  onCloseOthers = () => {
    return this.setState({ anchorEl: null });
  }

  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const { anchorEl } = this.state;
    const currentRoute = this.parseRoute();

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11}>
        <Grid container spacing={2} className={classes.noWrap} alignItems="center">
          {/* Logo */}
          <Grid item className={classes.logo}>
            <Link color="textPrimary" underline="none" component={RouterLink} to={'/swap'}>
              <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
                <Grid item style={{ width: 40 }}>
                  <Image
                    src={SEN_LOGO}
                    color="#00000000"
                    loading={<CircularProgress size={17} />}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h6" noWrap>SenSwap</Typography>
                </Grid>
              </Grid>
            </Link>
          </Grid>
          {/* Menu */}
          <Grid item className={classes.stretch}>
            <Grid container alignItems="center" justify="flex-end" spacing={width >= 600 ? 5 : 2}>
              {/* Pool */}
              <Grid item>
                <Tooltip title="Pool">
                  <IconButton
                    size="small"
                    color={currentRoute === 'pool' ? 'primary' : 'secondary'}
                    component={RouterLink}
                    to={'/pool'}
                  >
                    <LocalGasStationRounded />
                  </IconButton>
                </Tooltip>
              </Grid>
              {/* Swap */}
              <Grid item>
                <Tooltip title="Swap">
                  <IconButton
                    size="small"
                    color={currentRoute === 'swap' ? 'primary' : 'secondary'}
                    component={RouterLink}
                    to={'/swap'}
                  >
                    <SwapCallsRounded />
                  </IconButton>
                </Tooltip>
              </Grid>
              {/* Others */}
              <Grid item>
                <Tooltip title="Others">
                  <IconButton
                    color={currentRoute !== 'pool' && currentRoute !== 'swap' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={this.onOpenOthers}
                  >
                    <WidgetsRounded />
                  </IconButton>
                </Tooltip>
                <Popover
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={this.onCloseOthers}
                  onClick={this.onCloseOthers}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <List>
                    <ListItem button component={RouterLink} to={'/faucet'}>
                      <ListItemIcon>
                        <ColorizeRounded color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="SenFaucet" />
                    </ListItem>
                    <ListItem button component={RouterLink} to={'/issuer'}>
                      <ListItemIcon>
                        <AccountBalanceRounded color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="SenIssuer" />
                    </ListItem>
                    <ListItem button component={RouterLink} to={'/audit'}>
                      <ListItemIcon>
                        <VerifiedUserRounded color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="SenAudit" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={RouterLink} to={WHITEPAPER} target="_blank" rel="noopener">
                      <ListItemIcon>
                        <DescriptionRounded color="secondary" />
                      </ListItemIcon>
                      <ListItemText primary="Whitepaper" />
                    </ListItem>
                  </List>
                </Popover>
              </Grid>
              {/* Connect wallet */}
              {this.walletConnectionButton()}
            </Grid>
          </Grid>
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
  openWallet,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header)));