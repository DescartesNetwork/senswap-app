import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { LanguageRounded } from '@material-ui/icons';

import InitializeNetwork from './intializeNetwork';

import styles from './styles';

class Network extends Component {

  render() {
    const { classes } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center" className={classes.noWrap}>
          <Grid item>
            <IconButton>
              <LanguageRounded />
            </IconButton>
          </Grid>
          <Grid item>
            <Typography variant="h6">Network</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <InitializeNetwork />
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
)(withStyles(styles)(Network)));