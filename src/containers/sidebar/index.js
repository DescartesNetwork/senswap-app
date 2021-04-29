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

import {
  WidgetsRounded, SwapCallsRounded, LayersRounded,
  AccountBalanceWalletRounded, AccountBalanceRounded, VerifiedUserRounded,
  GroupWorkRounded, ColorizeRounded, DescriptionRounded,
  DonutLargeRounded,
} from 'senswap-ui/icons';

import styles from './styles';
import configs from 'configs';
import YELLOWPAPER from 'static/docs/senswap_yellowpaper.pdf';
import { setAdvance, unsetAdvance } from 'modules/ui.reducer';


class Sidebar extends Component {
  constructor() {
    super();

    this.state = {
      visible: true,
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
    const { visible } = this.state;
    return this.setState({ visible: !visible });
  }

  onAdvance = (e) => {
    const { setAdvance, unsetAdvance } = this.props;
    const advance = e.target.checked || false;
    if (advance) return setAdvance();
    return unsetAdvance();
  }

  render() {
    const { classes } = this.props;
    const { wallet: { user: { address, role } } } = this.props;
    const { visible, route } = this.state;
    const { sol: { cluster }, basics: { permission } } = configs;
    const isLogged = ssjs.isAddress(address) && permission.includes(role);

    return <Drawer open={visible}>
      <Grid container>
        {/* Safe space */}
        <Grid item xs={12} />
        {/* Sen logo */}
        <Grid item xs={12}>
          <Brand subtitle={cluster} />
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
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  wallet: state.wallet,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setAdvance, unsetAdvance,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Sidebar)));