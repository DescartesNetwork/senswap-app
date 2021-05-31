import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';

import styles from './styles';
import utils from 'helpers/utils';

class BottomDrawer extends Component {

  renderSwipArea = () => {
    const { classes } = this.props;
    const isMobile = utils.checkDevice();
    if (isMobile) return <Grid container spacing={2} justify="center">
      <Grid item>
        <div className={classes.touchBarSign} />
      </Grid>
    </Grid>
    return <Grid container spacing={2} justify="center">
      <Tooltip title="Click to close">
        <Grid item className={classes.swipeableArea} onClick={this.props.onClose}>
          <div className={classes.touchBarSign} />
        </Grid>
      </Tooltip>
    </Grid>
  }

  render() {
    const { classes } = this.props;
    return <SwipeableDrawer
      anchor="bottom"
      open={this.props.visible}
      onOpen={this.props.onOpen}
      onClose={this.props.onClose}
      classes={{ paper: classes.paper }}
    >
      <Grid container spacing={2} className={classes.paperContent}>
        <Grid item xs={12}>
          {this.renderSwipArea()}
        </Grid>
        <Grid item xs={12} className={classes.paperBody}>
          {this.props.children}
        </Grid>
      </Grid>
    </SwipeableDrawer >
  }
}

BottomDrawer.defaultProps = {
  onOpen: () => { },
  onClose: () => { },
}

BottomDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
}

export default withStyles(styles)(BottomDrawer);
