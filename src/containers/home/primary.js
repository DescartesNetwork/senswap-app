import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import { ImportContactsRounded, ArrowBackRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';
import Drain from 'components/drain';

import styles from './styles';

class PrimaryBlog extends Component {
  render() {
    // const { classes } = this.props;
    const { title, subtitle, description, url } = this.props;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <BaseCard>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">{subtitle}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Drain small />
            </Grid>
            <Grid item xs={12}>
              <Typography>{description}</Typography>
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
                    <IconButton size="small" color="secondary" href={url} target="_blank">
                      <ImportContactsRounded />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
  }
}

PrimaryBlog.defaultProps = {
  title: '',
  subtitle: '',
  description: '',
  url: '#',
}

PrimaryBlog.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  url: PropTypes.string,
}

export default withStyles(styles)(PrimaryBlog);