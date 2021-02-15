import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import isEqual from 'react-fast-compare';
import ssjs from 'senswapjs';

import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import styles from './styles';
import utils from 'helpers/utils';
import { setError } from 'modules/ui.reducer';
import { getPoolData } from 'modules/bucket.reducer';


class PoolPrice extends Component {
  constructor() {
    super();

    this.state = {
      price: 0,
    }

    this.swap = window.senwallet.swap;
  }

  componentDidMount() {
    this.watch();
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { address: prevAddress } = prevProps;
    const { address } = this.props;
    if (!isEqual(address, prevAddress)) {
      this.watch();
      this.fetchData();
    }
  }

  componentWillUnmount() {
    this.unwatch();
  }

  watch = () => {
    this.unwatch(); // Safely unwatch prev address
    const { address } = this.props;
    if (!ssjs.isAddress(address)) return;
    const publicKey = ssjs.fromAddress(address);
    this.watchId = this.swap.connection.onAccountChange(publicKey, this.fetchData);
  }

  unwatch = () => {
    if (!this.watchId) return;
    return this.swap.connection.removeAccountChangeListener(this.watchId);
  }

  fetchData = () => {
    const { address, getPoolData, setError } = this.props;
    if (!ssjs.isAddress(address)) return this.setState({ price: 0 });
    return getPoolData(address, true).then(data => {
      const { lpt, reserve } = data;
      const price = ssjs.div(lpt, reserve);
      return this.setState({ price });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { price } = this.state;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5"><span className={classes.subtitle}>Price</span> ${utils.prettyNumber(price)}</Typography>
      </Grid>
    </Grid>
  }
}

const mapStateToProps = state => ({
  ui: state.ui,
  bucket: state.bucket,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  setError,
  getPoolData,
}, dispatch);

PoolPrice.defaultProps = {
  address: '',
}

PoolPrice.propTypes = {
  address: PropTypes.string,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PoolPrice)));