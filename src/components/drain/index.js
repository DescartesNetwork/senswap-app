import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import styles from './styles';

class Drain extends Component {
  render() {
    let { classes, small, large } = this.props;
    if (small)
      return <Grid container className={classes.small}></Grid>
    if (large)
      return <Grid container className={classes.large}></Grid>
    return <Grid container className={classes.default}></Grid>
  }
}

Drain.defaultProps = {
  small: false,
  large: false,
  default: true
}

Drain.propTypes = {
  small: PropTypes.bool,
  large: PropTypes.bool,
  default: PropTypes.bool,
}

export default withStyles(styles)(Drain);