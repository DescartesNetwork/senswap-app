import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Drain from 'senswap-ui/drain';
import Brand from 'senswap-ui/brand';
import Button from 'senswap-ui/button';
import Drawer from 'senswap-ui/drawer';

import { HomeRounded } from 'senswap-ui/icons';

import styles from './styles';


class Sidebar extends Component {

  render() {
    // const { classes } = this.props;
    return <Drawer>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Brand subtitle="Devnet" />
        </Grid>
        <Grid item xs={12}>
          <Drain />
        </Grid>
        <Grid item xs={12}>
          <Button to="/swap" startIcon={<HomeRounded />} size="large" fullWidth>
            <Typography>Swap</Typography>
          </Button>
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