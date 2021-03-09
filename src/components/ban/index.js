import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

import { ErrorOutlineRounded, RoomServiceRounded } from '@material-ui/icons';

import Drain from 'components/drain';

import styles from './styles';

class Ban extends Component {
  render() {
    const { classes } = this.props;
    return <Grid container justify="center" alignItems="center" spacing={2}>
      <Grid item xs={12}>
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="center" alignItems="center" spacing={0}>
          <Grid item>
            <IconButton size="small">
              <ErrorOutlineRounded color="primary" className={classes.icon} />
            </IconButton>
          </Grid>
          <Grid item xs={12}>
            <Typography align="center" variant="h4">Restricted zone</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={11}>
        <Typography align="center">This function is for users with permission such as <strong>admin</strong> or <strong>operator</strong> only.</Typography>
      </Grid>
      <Grid item xs={12} >
        <Drain small />
      </Grid>
      <Grid item xs={12}>
        <Grid container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              color="primary"
              onClick={this.onOpen}
              startIcon={<RoomServiceRounded />}
            >
              <Typography>Email to support team?</Typography>
            </Button>
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
)(withStyles(styles)(Ban)));