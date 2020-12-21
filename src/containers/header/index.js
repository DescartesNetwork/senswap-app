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
import Fab from '@material-ui/core/Fab';
import Image from 'material-ui-image';

import {
  SwapCallsRounded, LocalGasStationRounded, PhonelinkLockRounded,
  GavelRounded, MobileFriendlyRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import SEN_LOGO from 'static/images/sen-logo.svg';
import styles from './styles';
import { openWallet } from 'modules/wallet.reducer';


class Header extends Component {

  parseRoute = () => {
    const { location: { pathname } } = this.props;
    const route = pathname.split('/')[1];
    console.log(route)
    return route;
  }

  connectWallet = () => {
    return this.props.openWallet();
  }

  walletConnectionButton = () => {
    const { ui: { width }, wallet: { address } } = this.props;
    const icon = address ? <MobileFriendlyRounded size="small" /> : <PhonelinkLockRounded size="small" />;
    const text = address ? 'Connected' : 'Connect Wallet';

    if (width >= 600) return <Grid item>
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={this.connectWallet}
        endIcon={icon}
      >
        <Typography noWrap>{text}</Typography>
      </Button>
    </Grid>
    return <Grid item>
      <Tooltip title={text}>
        <Fab size="small" color="primary" onClick={this.connectWallet}>
          {icon}
        </Fab>
      </Tooltip>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;
    const currentRoute = this.parseRoute();

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <BaseCard>
          <Grid container spacing={2} className={classes.noWrap} alignItems="center">
            {/* Logo */}
            <Grid item className={classes.logo}>
              <Link color="textPrimary" underline="none" component={RouterLink} to={'/home'}>
                <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
                  <Grid item style={{ width: 35 }}>
                    <Image
                      src={SEN_LOGO}
                      color="#00000000"
                      loading={<CircularProgress size={17} />}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" noWrap>SenSwap</Typography>
                  </Grid>
                </Grid>
              </Link>
            </Grid>
            {/* Menu */}
            <Grid item className={classes.stretch}>
              <Grid container alignItems="center" justify="flex-end" spacing={width >= 960 ? 5 : 2}>
                {/* Governance */}
                <Grid item>
                  <Tooltip title="Governance">
                    <IconButton
                      size="small"
                      color={currentRoute === 'governance' ? 'primary' : 'secondary'}
                      component={RouterLink}
                      to={'/governance'}
                    >
                      <GavelRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {/* Liquidity Provider */}
                <Grid item>
                  <Tooltip title="Liquidity Provider">
                    <IconButton
                      size="small"
                      color={currentRoute === 'pool' ? 'primary' : 'secondary'}
                      component={RouterLink
                      } to={'/pool'}
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
                {/* Connect wallet */}
                {this.walletConnectionButton()}
              </Grid>
            </Grid>
          </Grid>
        </BaseCard>
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