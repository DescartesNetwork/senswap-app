import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';

import Drain from 'components/drain';
import SecretKey from './secretKey';
import Keystore from './keystore';

import styles from './styles';


class LogIn extends Component {

  render() {
    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <SecretKey />
      </Grid>
      <Grid item xs={12}>
        <Drain />
      </Grid>
      <Grid item xs={12}>
        <Keystore />
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
)(withStyles(styles)(LogIn)));