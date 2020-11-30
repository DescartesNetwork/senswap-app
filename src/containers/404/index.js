import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { } from '@material-ui/icons';

import styles from './styles';


class NotFound extends Component {

  render() {
    // const { classes } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={10}>
        <Typography variant="h1">Page not found</Typography>
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
)(withStyles(styles)(NotFound)));