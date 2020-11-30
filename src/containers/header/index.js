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
import Image from 'material-ui-image';

import {
  SwapCallsRounded, PoolRounded, LockRounded,
  SettingsRounded, GavelRounded,
} from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import LOGO from 'static/images/logo.png';
import styles from './styles';

class Header extends Component {

  render() {
    const { classes } = this.props;
    const { ui: { width } } = this.props;

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11} md={10}>
        <BaseCard>
          <Grid container spacing={2} className={classes.noWrap} alignItems="center">
            {/* Logo */}
            <Grid item className={classes.logo}>
              <Link color="textPrimary" underline="none" component={RouterLink} to={'/home'}>
                <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
                  <Grid item style={{ width: 35 }}>
                    <Image src={LOGO} aspectRatio={(512 / 512)} />
                  </Grid>
                  <Grid item>
                    <Typography variant="body2" noWrap>SenSwap</Typography>
                  </Grid>
                </Grid>
              </Link>
            </Grid>
            {/* Menu */}
            <Grid item className={classes.stretch}>
              <Grid container alignItems="center" justify="flex-end" spacing={width >= 960 ? 5 : 3}>
                {/* Governance */}
                <Grid item>
                  <Tooltip title="Governance">
                    <IconButton size="small" color="secondary">
                      <GavelRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {/* Liquidity Provider */}
                <Grid item>
                  <Tooltip title="Liquidity Provider">
                    <IconButton size="small" color="secondary">
                      <PoolRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {/* Swap */}
                <Grid item>
                  <Tooltip title="Swap">
                    <IconButton size="small" color="secondary">
                      <SwapCallsRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {/* Setting */}
                <Grid item>
                  <Tooltip title="Settings">
                    <IconButton size="small" color="secondary">
                      <SettingsRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
                {/* Connect wallet */}
                <Grid item>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    endIcon={<LockRounded size="small" />}
                  >
                    <Typography noWrap>Connect Wallet</Typography>
                  </Button>
                </Grid>
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
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header)));