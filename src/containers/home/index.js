import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Drain from 'components/drain';

import PrimaryBlog from './primary';

import blogs from './blogs';
import styles from './styles';


class Home extends Component {

  render() {
    const mainBlog = blogs[0];

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={10}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5">Welcome to</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3">SenSwap</Typography>
              </Grid>
              <Grid item xs={12}>
                <Drain large />
              </Grid> </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <PrimaryBlog
              title={mainBlog.title}
              subtitle={mainBlog.subtitle}
              description={mainBlog.description}
              url={mainBlog.url}
            />
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
)(withStyles(styles)(Home)));