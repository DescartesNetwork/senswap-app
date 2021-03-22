import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';

import styles from '../styles';
import { } from 'modules/bucket.reducer';
import { getPools, getPool } from 'modules/pool.reducer';
import { setError } from 'modules/ui.reducer';


const EMPTY_ADDRESS = '11111111111111111111111111111111';

class PoolAction extends Component {
  constructor() {
    super();

    this.state = {
      data: []
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { network: prevNetwork } = prevProps;
    const { network } = this.props;
    if (!isEqual(network, prevNetwork)) this.fetchData();
  }

  fetchData = () => {
    const { network, getPools, getPool, setError } = this.props;
    return getPools({ network }, 1000, 0).then(data => {
      return Promise.all(data.map(({ _id }) => getPool(_id)));
    }).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>

      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
  pool: state.pool,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  getPools, getPool,
  setError,
}, dispatch);

PoolAction.propTypes = {
  network: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PoolAction)));