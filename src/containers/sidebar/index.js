import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Drain from 'senswap-ui/drain';
import Brand from 'senswap-ui/brand';
import Drawer from 'senswap-ui/drawer';
import List from 'senswap-ui/list';
import ListItem from 'senswap-ui/listItem';
import ListItemIcon from 'senswap-ui/listItemIcon';
import ListItemText from 'senswap-ui/listItemText';

import { HomeRounded } from 'senswap-ui/icons';

import styles from './styles';


class Sidebar extends Component {

  render() {
    const { classes } = this.props;
    return <Drawer>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Brand subtitle="Devnet" />
        </Grid>
        <Grid item xs={12}>
          <Drain />
        </Grid>
        <Grid item xs={12}>
          <List>
            <ListItem button to="/swap" className={classes.listItem}>
              <ListItemIcon className={classes.listItem}>
                <HomeRounded />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Drawer>
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
)(withStyles(styles)(Sidebar)));