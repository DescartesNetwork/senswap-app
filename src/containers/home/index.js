import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { OpenInNewRounded, ArrowBackRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';

import blogs from './blogs';
import styles from './styles';
import liquid1 from 'static/images/liquid1.jpg';
import liquid2 from 'static/images/liquid1.jpg';
import liquid3 from 'static/images/liquid1.jpg';


class Home extends Component {

  render() {
    const { classes } = this.props;
    const mainBlog = blogs[0];

    return <Grid container justify="center" spacing={2}>
      <Grid item xs={11}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5">Welcome to</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3">SenSwap</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} style={{ backgroundImage: `url('${liquid1}')` }} className={classes.gallery}>
            <BaseCard variant="fluent">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{mainBlog.title}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">{mainBlog.subscript}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Drain small />
                </Grid>
                <Grid item xs={12}>
                  <Typography>{mainBlog.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Grid container justify="space-between" alignItems="center" spacing={2}>
                    <Grid item>
                      <Tooltip title="Previous blogs">
                        <IconButton size="small" color="secondary">
                          <ArrowBackRounded />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Open in a new window">
                        <IconButton size="small" color="secondary" href={mainBlog.url} target="_blank">
                          <OpenInNewRounded />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </BaseCard>
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