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
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';

import { PersonOutlineRounded } from '@material-ui/icons';

import Token from './token';

import styles from './styles';
import { getNetworkData } from 'modules/bucket.reducer';
import { setError } from 'modules/ui.reducer';


const EMPTY_ADDRESS = '11111111111111111111111111111111';

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
    const { data } = this.state;
    const mints = data.mints || [];
    const dao = data.dao || {};
    const signers = dao.signers || [];

    return <Grid container spacing={2}>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" align="right">Network Address</Typography>
        <Typography className={classes.subtitle} align="right">{data.address}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} >
        <Typography>Signers list</Typography>
      </Grid>
      {signers.map((signer, index) => {
        if (signer === EMPTY_ADDRESS) return null;
        return <Grid item key={index}>
          <Chip color="secondary" icon={<PersonOutlineRounded />} label={signer} />
        </Grid>
      })}
      <Grid item xs={12} >
        <Typography>Tokens list</Typography>
      </Grid>
      {mints.map((address, index) => <Grid item key={index}>
        <Token address={address} readOnly />
      </Grid>)}
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

NetworkInfo.propTypes = {
  address: PropTypes.string.isRequired,
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(NetworkInfo)));