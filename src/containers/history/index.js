import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Brand from 'senswap-ui/brand';
import Drawer from 'senswap-ui/drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'senswap-ui/list';
import Divider from 'senswap-ui/divider';
import { IconButton } from 'senswap-ui/button';

import { MenuOpenRounded } from 'senswap-ui/icons';

import styles from './styles';
import { toggleRightBar } from 'modules/ui.reducer';


class Sidebar extends Component {

  render() {
    const { classes, ui: { rightbar }, toggleRightBar } = this.props;

    return <Drawer
      open={rightbar}
      anchor="right"
      variant="temporary"
      onClose={toggleRightBar}
    >
      <Grid container>
        {/* Safe space */}
        <Grid item xs={12} />
        {/* Sen logo */}
        <Grid item xs={12}>
          <Grid container className={classes.noWrap} alignItems="center">
            <Grid item className={classes.stretch}>
              <Brand />
            </Grid>
            <Grid item>
              <IconButton onClick={toggleRightBar}>
                <MenuOpenRounded />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Drain size={1} />
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
  toggleRightBar,
}, dispatch);

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Sidebar)));