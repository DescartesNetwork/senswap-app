import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Brand from 'senswap-ui/brand';
import Drawer from 'senswap-ui/drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'senswap-ui/list';
import Divider from 'senswap-ui/divider';
import { IconButton } from 'senswap-ui/button';

import Fab from '@material-ui/core/Fab';

import {
  WidgetsRounded, SwapCallsRounded, LayersRounded,
  AccountBalanceWalletRounded, AccountBalanceRounded, VerifiedUserRounded,
  GroupWorkRounded, ColorizeRounded, DescriptionRounded,
  DonutLargeRounded, MenuOpenRounded, MenuRounded
} from 'senswap-ui/icons';

import styles from './styles';
import configs from 'configs';
import YELLOWPAPER from 'static/docs/senswap_yellowpaper.pdf';
import { toggleLeftBar } from 'modules/ui.reducer';
import { Typography } from '@material-ui/core';


class Sidebar extends Component {
  constructor() {
    super();

    this.state = {
      route: ''
    }
  }

  componentDidMount() {
    this.parseRoute();
  }

  componentDidUpdate(prevProps) {
    const { location: prevLocation } = prevProps;
    const { location } = this.props;
    if (!isEqual(prevLocation, location)) this.parseRoute();
  }

  parseRoute = () => {
    const { location: { pathname } } = this.props;
    const route = pathname.split('/')[1];
    return this.setState({ route })
  }

  onDrawer = () => {
    const { toggleLeftBar } = this.props;
    return toggleLeftBar();
  }

  render() {
    const { classes, ui: { leftbar, width }, wallet: { user: { address, role } }, toggleLeftBar } = this.props;
    const { route } = this.state;
    const { sol: { cluster }, basics: { permission } } = configs;
    const isLogged = ssjs.isAddress(address) && permission.includes(role);

    return <Fragment>
      {!leftbar ? <Fab
        color="primary"
        size="medium"
        onClick={toggleLeftBar}
        className={classes.fab}
      >
        <MenuRounded />
      </Fab> : null}
      <Drawer open={leftbar} variant={width >= 600 ? 'persistent' : 'temporary'}>
        <Grid container>
          {/* Safe space */}
          <Grid item xs={12} />
          {/* Sen logo */}
          <Grid item xs={12}>
            <Grid container className={classes.noWrap} alignItems="center">
              <Grid item className={classes.stretch}>
                <Brand subtitle={cluster} />
              </Grid>
              <Grid item>
                <IconButton onClick={toggleLeftBar}>
                  <MenuOpenRounded />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Drain size={1} />
          </Grid>
          <Grid item xs={12}>
            <List>
              <ListItem
                button
                component={RouterLink}
                to="/home"
                className={route === 'home' ? classes.listItemActive : classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <WidgetsRounded />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
              <ListItem
                button
                component={RouterLink}
                to="/swap"
                className={route === 'swap' ? classes.listItemActive : classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <SwapCallsRounded />
                </ListItemIcon>
                <ListItemText primary="Swap" />
              </ListItem>
              <ListItem
                button
                component={RouterLink}
                to="/pool"
                className={route === 'pool' ? classes.listItemActive : classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <LayersRounded />
                </ListItemIcon>
                <ListItemText primary="Pool" />
              </ListItem>
              <ListItem
                button
                component={RouterLink}
                to="/wallet"
                className={route === 'wallet' ? classes.listItemActive : classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <AccountBalanceWalletRounded />
                </ListItemIcon>
                <ListItemText primary="Wallet" />
              </ListItem>
              {/* Faucet */}
              {cluster === 'devnet' ? <Fragment>
                <Drain size={2} />
                <Divider />
                <Drain size={2} />
                <ListItem
                  button
                  component={RouterLink}
                  to="/faucet"
                  className={route === 'faucet' ? classes.listItemActive : classes.listItem}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <ColorizeRounded />
                  </ListItemIcon>
                  <ListItemText primary="Faucet" secondary="Devnet only" />
                </ListItem>
              </Fragment> : null}
              {/* Admin/Operator zone */}
              {isLogged ? <Fragment>
                <Drain size={2} />
                <Divider />
                <Drain size={2} />
                <ListItem
                  button
                  component={RouterLink}
                  to="/issuer"
                  className={route === 'issuer' ? classes.listItemActive : classes.listItem}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <AccountBalanceRounded />
                  </ListItemIcon>
                  <ListItemText primary="Issuer" />
                </ListItem>
                <ListItem
                  button
                  component={RouterLink}
                  to="/audit"
                  className={route === 'audit' ? classes.listItemActive : classes.listItem}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <VerifiedUserRounded />
                  </ListItemIcon>
                  <ListItemText primary="Audit" />
                </ListItem>
                <ListItem
                  button
                  component={RouterLink}
                  to="/dao"
                  className={route === 'dao' ? classes.listItemActive : classes.listItem}
                >
                  <ListItemIcon className={classes.listItemIcon}>
                    <GroupWorkRounded />
                  </ListItemIcon>
                  <ListItemText primary="DAO" />
                </ListItem>
              </Fragment> : null}
              {/* Papers */}
              <Drain size={2} />
              <Divider />
              <Drain size={2} />
              <ListItem
                button
                component={RouterLink}
                to="/tokenomic"
                target="_blank"
                rel="noopener"
                className={classes.listItem}
                disabled
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <DonutLargeRounded />
                </ListItemIcon>
                <ListItemText primary="Whitepaper & Tokenomic" />
              </ListItem>
              <ListItem
                button
                component={RouterLink}
                to={YELLOWPAPER}
                target="_blank"
                rel="noopener"
                className={classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <DescriptionRounded />
                </ListItemIcon>
                <ListItemText primary="Yellow Paper" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Drawer>
    </Fragment>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  toggleLeftBar,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Sidebar)));