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
    const { children, variant, className } = this.props;
    const compoundClassName = `${variant === 'material' ? classes.materialPaper : classes.fluentPaper} ${className}`

    return <Grid container spacing={2} >
      <Grid item xs={12}>
        <Paper className={compoundClassName} elevation={2}>
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
  className: '',
}

BaseCard.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  variant: PropTypes.oneOf(['material', 'fluent']),
  className: PropTypes.string,
}

export default withRouter(withStyles(styles)(BaseCard));