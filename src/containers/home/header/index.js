import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';

import { WalletButton } from 'containers/wallet';

import styles from './styles';


class Header extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            {/* Search */}
          </Grid>
          <Grid item>
            <WalletButton />
          </Grid>
        </Grid>
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