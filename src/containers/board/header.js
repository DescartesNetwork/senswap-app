import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';

import { WalletButton } from 'containers/wallet';
import { PoolAvatar } from 'containers/pool';

import styles from './styles';


class Header extends Component {

  parseIcon = () => {
    const { poolData } = this.props;
    const { mint_a, mint_b, mint_s } = poolData;
    const { icon: iconA } = mint_a || {};
    const { icon: iconB } = mint_b || {};
    const { icon: iconS } = mint_s || {};
    const icons = [iconA, iconB, iconS];
    return icons;
  }

  parseName = () => {
    const { poolData } = this.props;
    const { mint_a, mint_b, mint_s } = poolData;
    const { symbol: symbolA } = mint_a || {};
    const { symbol: symbolB } = mint_b || {};
    const { symbol: symbolS } = mint_s || {};
    return `${symbolA} x ${symbolB} x ${symbolS}`;
  }

  render() {
    const { classes } = this.props;

    return <Grid container>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap} alignItems="center">
          <Grid item className={classes.stretch}>
            <PoolAvatar icons={this.parseIcon()} />
          </Grid>
          <Grid item>
            <WalletButton />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4">{this.parseName()}</Typography>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

Header.defaultProps = {
  poolData: {},
}

Header.propTypes = {
  poolData: PropTypes.object,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Header)));