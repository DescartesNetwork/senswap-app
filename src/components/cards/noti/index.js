import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { PageviewRounded } from '@material-ui/icons';

import { BaseCard } from 'components/cards';

import styles from './styles';


class NotiCard extends Component {

  render() {
    const { classes } = this.props;
    const { title, description, source } = this.props;

    return <Grid container spacing={2} justify="center">
      <Grid item xs={12} className={classes.gallery}>
        <BaseCard variant="fluent">
          <Grid container spacing={2} justify="flex-end">
            <Grid item xs={12}>
              <Typography variant="body2">{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>{description}</Typography>
            </Grid>
            <Grid item>
              <Button
                startIcon={<PageviewRounded />}
                component={RouterLink}
                to={source}
              >
                <Typography>Learn more</Typography>
              </Button>
            </Grid>
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
  }
}

NotiCard.defaultProps = {
  title: '',
  description: '',
  source: '#'
}

NotiCard.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  source: PropTypes.string,
}

export default withRouter(withStyles(styles)(NotiCard));