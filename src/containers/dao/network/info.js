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
import Divider from '@material-ui/core/Divider';

import Drain from 'components/drain'
import Token from './token';

import styles from './styles';
import { getNetworkData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


class NetworkInfo extends Component {
  constructor() {
    super();

    this.state = {
      data: {},
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { address: prevAddress } = prevProps;
    const { address } = this.props;
    if (!isEqual(prevAddress, address)) this.fetchData()
  }

  fetchData = () => {
    const { address, getNetworkData, setError } = this.props;
    if (!ssjs.isAddress(address)) return;
    return getNetworkData(address).then(data => {
      return this.setState({ data });
    }).catch(er => {
      return setError(er);
    });
  }

  render() {
    const { classes } = this.props;
    const { index } = this.props;
    const { data } = this.state;
    const mints = data.mints || [];
    const i = index + 1;

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center" className={classes.noWrap}>
          <Grid item className={classes.stretch}>
            <Typography variant="body2" align="right">Network Address</Typography>
            <Typography className={classes.subtitle} align="right">{data.address}</Typography>
          </Grid>
          {i ? <Grid item>
            <Typography variant="h3">#{i}</Typography>
          </Grid> : null}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      {mints.map((address, index) => <Grid item key={index}>
        <Token address={address} readOnly />
      </Grid>)}
      <Grid item xs={12}>
        <Drain />
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
  getNetworkData,
}, dispatch);

NetworkInfo.defaultProps = {
  index: -1
}

NetworkInfo.propTypes = {
  address: PropTypes.string.isRequired,
  index: PropTypes.number,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkInfo)));