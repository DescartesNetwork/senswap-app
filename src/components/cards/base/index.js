import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import { } from '@material-ui/icons';

import styles from './styles';


class BaseCard extends Component {

  render() {
    const { classes } = this.props;
    const { children, variant } = this.props;

    return <Grid container spacing={2} >
      <Grid item xs={12} elevation={2}>
        <Paper className={variant === 'material' ? classes.materialPaper : classes.fluentPaper}>
          <Grid container spacing={2} >
            <Grid item xs={12}>
              {children}
            </Grid>
          </Grid >
        </Paper>
      </Grid>
    </Grid >
  }
}

BaseCard.defaultProps = {
  children: null,
  variant: 'material',
}

BaseCard.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  variant: PropTypes.oneOf(['material', 'fluent'])
}

export default withRouter(withStyles(styles)(BaseCard));