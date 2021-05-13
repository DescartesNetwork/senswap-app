import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from 'senswap-ui/styles';
import Grid from 'senswap-ui/grid';
import Typography from 'senswap-ui/typography';
import Button from 'senswap-ui/button';
import Paper from 'senswap-ui/paper';
import Link from 'senswap-ui/link';

import { MovieFilterRounded } from 'senswap-ui/icons';

import styles from './styles';


class Introduction extends Component {

  render() {
    const { classes } = this.props;

    return <Paper className={classes.paper}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5">High transaction fees & slow confirmations?</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography color="textSecondary">SenSwap is everything you need to turn it into a thing of the past. Let’s swap with slow transaction fees and faster confirmation times.</Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<MovieFilterRounded />}
          >
            <Typography>Introduction Video</Typography>
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <Link href="#">User Guide</Link>
            </Grid>
            <Grid item xs={12}>
              <Link href="#">Have a problem? Just get in touch</Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
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
)(withStyles(styles)(Introduction)));