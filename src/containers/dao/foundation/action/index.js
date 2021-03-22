import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import PoolAction from './pool';

import styles from '../styles';


class FoundationAction extends Component {
  render() {
    // const { classes } = this.props;
    const { network } = this.props;

    if (!ssjs.isAddress(network)) return null;
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <PoolAction network={network} />
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
});

const mapDispatchToProps = dispatch => bindActionCreators({
}, dispatch);

FoundationAction.defaultProps = {
  network: '',
}

FoundationAction.propTypes = {
  network: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(FoundationAction)));